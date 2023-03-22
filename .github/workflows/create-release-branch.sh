#!/bin/bash
set -e

# Gets the tags for the current SHA, filtered to the ones that look like a version number
current=$(git tag --points-at HEAD | grep -e "^v[0-9]*" | sort -V | tail -n 1)

# Extract the major version from the tag
major=$(echo $current | sed -e "s/^v\([0-9]*\).*/\1/")

npm run prepare

git config user.name github-actions
git config user.email github-actions@github.com


git switch -C "v$major"
git add dist/index.js --force
git commit -m "Build for release $current"

git push -u origin "v$major" --force

gh release create "$current-release" --title "$current" --generate-notes --target "v$major" dist/index.js action.yml
