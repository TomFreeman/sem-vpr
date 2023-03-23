import * as github from '@actions/github';
import * as core from '@actions/core';
import { Versioner, VersionerSettings } from './versioner';
import { getTags, getBranchName, getLabels, tagNewVersion, shouldProceed, isPrerelease } from './git';
import { Config, getConfig } from './config';

export function buildSettings(labels: string[], config: Config, branch: string): VersionerSettings {
  const settings = {} as VersionerSettings;

  if (labels.includes(config.majorLabel)) {
    settings.major = true;
  } else if (labels.includes(config.minorLabel)) {
    settings.minor = true;
  }

  if (shouldTagPrerelease(labels, config) && isPrerelease(config)) {
    settings.suffix = branch;
  }

  settings.prefix = config.prefix || 'v';

  return settings;
}

export function shouldTagPrerelease(labels: string[], config: Config): boolean {
  return config.tagPrerelease ||
    labels.includes(config.prereleaseLabel);
}

// most @actions toolkit packages have async methods
async function run() {
  try {
    if (github.context.eventName !== 'pull_request') {
      console.log('This action is designed only to work for pull requests');
      return;
    }

    const config = getConfig();

    // Get the tags from the git history
    const tags = await getTags();
    const labels = getLabels();
    const tagPrerelease = shouldTagPrerelease(labels, config);

    if (!shouldProceed(tagPrerelease)) {
      return;
    }

    const branch = getBranchName();
    const settings = buildSettings(
      labels,
      config,
      branch);

    const versioner = new Versioner(
      tags, settings);

    const newVersion = await versioner.calculateNextVersion();

    // Tag the new version
    await tagNewVersion(config.token, newVersion);
  } catch (err) {
    console.log("Error: ", err)
    core.setFailed((err as Error).message);
  }
}

run();
