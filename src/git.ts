import { exec, getExecOutput } from "@actions/exec";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { PullRequestEvent, WebhookEvent } from "@octokit/webhooks-types";
import { RequestError } from "@octokit/request-error";

const context = github.context;

export async function getTags() {
  await exec(`git`, [`fetch`, `--tags`])
  const output = await getExecOutput(`git`, [`tag`, `-l`])

  if (output.exitCode != 0) {
    console.log(`Fetch tags failed, ${output.stderr}`);
    throw new Error(`No tags found, ${output.stderr}`);
  }


  const tags = output.stdout.split(`\n`);
  return tags;
}

function getCurrentPR() {
  if (context.eventName !== `pull_request`) {
    throw new Error(`This action only works on pull requests`);
  }

  const pr = context.payload as PullRequestEvent

  return pr.pull_request
}

export function getBranchName() {
  const pr = getCurrentPR()
  return pr.head.ref
}

export function getLabels() {
  const pr = getCurrentPR()
  return pr.labels.map(label => label.name)
}

export async function tagNewVersion(githubToken: string, version: string) {
  const { GITHUB_SHA } = process.env;
  if (!githubToken) {
    throw new Error(`GITHUB_TOKEN is not set`);
  }

  if (!GITHUB_SHA) {
    throw new Error(`GITHUB_SHA is not set`);
  }

  const octokit = github.getOctokit(githubToken);

  const pr = context.payload as PullRequestEvent
  const owner = pr.repository.owner
  const repo = pr.repository.name

  const target_sha = pr.action === `closed`
    ? pr.pull_request.head.sha
    : GITHUB_SHA;

    console.log(`Creating tag ${version} for sha ${target_sha}`)
  const tagCreateResponse = await octokit.rest.git.createTag({
    ...context.repo,
    tag: version,
    message: pr.pull_request.title,
    object: target_sha,
    type: `commit`,
  });

  try {
    await octokit.rest.git.createRef({
      ...context.repo,
      ref: `refs/tags/${version}`,
      sha: tagCreateResponse.data.sha,
    });
  } catch (err) {
    const httpError = err as RequestError;
    if (httpError.status == 422) {
      console.log(`Attempting to update tag refs/tags/${version} as it appears to exist`)
      await octokit.rest.git.updateRef({
        ...context.repo,
        ref: `tags/${version}`,
        sha: tagCreateResponse.data.sha,
        force: true,
      });
    }
  }
}

const ignoredActions = [`assigned`,
  `unassigned`,
  `unlabeled`,
  `edited`,
  `review_requested`,
  `review_request_removed`,
  `auto_merge_disabled`,
  `auto_merge_enabled`,
  `milestoned`,
  `demilestoned`,
  `locked`,
  `unlocked`,
];

export function shouldProceed(tagPrerelease: boolean) {
  if (ignoredActions.includes(github.context.action)) {
    console.log(`This action is not relevant to tagging, skipping`);
    return false;
  }

  if (github.context.action != 'closed' && !tagPrerelease) {
    console.log(`This PR is still open, skipping tagging`);
    console.log(`To tag PRs that are still open, set the 'tag-prerelease' input to true`);
    return false;
  }

  const pr = getCurrentPR()

  if (github.context.action == 'closed' && !pr.merged) {
    console.log(`This PR is closed, but not merged, skipping tagging`);
    return false;
  }

  return true;
}
