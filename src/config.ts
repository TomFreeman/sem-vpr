import * as core from '@actions/core';

export type Config = {
    prefix: string;
    majorLabel: string;
    minorLabel: string;
    prereleaseLabel: string;
    tagPrerelease: boolean;
    skipReleaseLabel: string;
    releaseBranches: string[];
    token: string;
}

export function getConfig(): Config {
    return {
        prefix: core.getInput('prefix', { required: false }),
        majorLabel: core.getInput('major-release-label', { required: false }) || 'major',
        minorLabel: core.getInput('minor-release-label', { required: false }) || 'minor',
        prereleaseLabel: core.getInput('prerelease-label', { required: false }) || 'prerelease',
        tagPrerelease: core.getBooleanInput('tag-prerelease'),
        skipReleaseLabel: core.getInput('skip-release-label', { required: false }) || 'skip-release',
        releaseBranches: core.getInput('release-branches', { required: false }).split(','),
        token: core.getInput('github-token', { required: true })
    }
}
