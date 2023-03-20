# Automatically Tag PRs according to SemVer

There are many tools to automatically tag repos according to SemVer, this one is mine.

Different to other approaches, this one is based on the PRs. Giving engineers explicit control over versioning.

## How it works

The action is designed to run on pull requests, and will tag the PR with the next version number according to SemVer.

A developed can choose to label a PR as a major, minor or patch release, or leave it unlabeled. If the PR is unlabeled, the action will default to a patch release.

The version is determined from the existing tags and incremented accordingly.

To mark a PR as representing a major release, add the label `major`. For a minor release, add the label `minor`. For a patch release, add the label `patch` or omit the label.

By default the head of the PR won't be tagged, but you can configure the action to create a pre-release tag on the head of the PR. This is useful if you want to test the release before merging the PR. To enable this for every PR, set the `tag-prerelease` input to `true`. Alternatively you can add the label `prerelease` to a PR to enable this for that PR only. (Note: It is best to combine this with triggering the action on 'labeled' events.)

## Setup

### Pre-requisites

In order to write tags to your repo, a GitHub token with at least Content - Write permissions is required.

### How to Use

In order to tag your released versions, you must explicitly set the trigger to `closed`, for example, this is the minimum viable configuration:

```yaml
name: Tag PRs

on:
  pull_request:
   types:
      - opened
      - closed
      - reopened
      - synchronize
      - labeled

jobs:
  tag:
    uses: TomFreeman/sem-vpc@v0
    with:
      github-token: ${{ YOUR TOKEN }}
```

### Inputs

The action also supports the following configuration options:

- `prefix`: The prefix to use for the tag. Defaults to `v`.
- `tag-prerelease`: Whether to tag the head of the PR as a pre-release. Defaults to `false`. If true the tag will be suffixed with the branch name.
