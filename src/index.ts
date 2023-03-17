import * as core from '@actions/core';
import * as github from '@actions/github';
import { Versioner, Settings } from './versioner';
import { getTags, getBranchName, getLabels, tagNewVersion, shouldProceed } from './git';

function buildSettings(labels: string[], prefix: string, branch: string, tagPrerelease: boolean): Settings {
  const settings = {} as Settings;

  if (labels.includes('major')) {
    settings.major = true;
  } else if (labels.includes('minor')) {
    settings.minor = true;
  }

  if (tagPrerelease) {
    settings.suffix = branch;
  }

  settings.prefix = prefix || 'v';

  return settings;
}

function shouldTagPrerelease(labels: string[]): boolean {
  const prereleaseSetting = core.getInput('tag-prerelease')
  if (prereleaseSetting) {
    return labels.includes('pre-release')
  } else {
    return core.getBooleanInput('tag-prerelease') || labels.includes('prerelease');
  }
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    if (github.context.eventName !== 'pull_request') {
      console.log('This action is designed only to work for pull requests');
      return;
    }

    // Get the tags from the git history
    const tags = await getTags();
    const prefix = core.getInput('prefix');
    const labels = getLabels();
    const tagPrerelease = shouldTagPrerelease(labels);

    if (!shouldProceed(tagPrerelease)) {
      return;
    }

    const githubToken = core.getInput('github-token');
    const branch = getBranchName();
    const settings = buildSettings(
      labels,
      prefix,
      branch,
      tagPrerelease);

    const versioner = new Versioner(
      tags, settings);

    const newVersion = await versioner.calculateNextVersion();

    // Tag the new version
    await tagNewVersion(githubToken, newVersion);
  } catch (err) {
    console.log("Error: ", err)
    core.setFailed((err as Error).message);
  }
}

run();
