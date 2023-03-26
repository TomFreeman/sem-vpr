import * as semver from 'semver'

export type VersionerSettings = {
  major: boolean,
  minor: boolean,
  prefix: string,
  suffix: string,
  noPrefix: boolean,
}

// Versioner wraps the logic for calculating the next version
export class Versioner {
  tags: string[];
  settings: VersionerSettings;

  constructor(tags, settings) {
    settings = settings || {} as VersionerSettings;

    if (!settings.noPrefix && !settings.prefix) {
      settings.prefix = 'v';
    }

    this.tags = tags;
    this.settings = settings;
  }


  buildTag(version) {
    // Add a prefix to the version
    version = `${this.settings.prefix}${version}`;

    // Add a suffix to the version
    if (this.settings.suffix) {
      version = `${version}-${this.settings.suffix}`;
    }

    return version;
  }

  getLatestTag() {
    const semverTags = (this.tags || []).map(tag =>
      {
        if (tag.startsWith(this.settings.prefix)) {
          tag = tag.substring(this.settings.prefix.length);
        }

        return semver.clean(tag)
      }).filter(tag => tag);

    if (!semverTags || semverTags.length === 0) {
      console.log('No tags found, using 0.0.0');
      return '0.0.0';
    } else {
      // Filter out all the prerelease tags and sort them
      var filteredTags = this.tags.filter(tag => !tag.includes('-'));
      filteredTags.sort(semver.compare);
      var tag = filteredTags[filteredTags.length - 1];

      if (tag.startsWith(this.settings.prefix)) {
        tag = tag.substring(this.settings.prefix.length);
      }

      return tag
    }
  }

  incrementVersion(latestTag) {
    // Split the latest tag into its parts
    const current = semver.parse(latestTag);

    // Increment the version
    if (this.settings.major) {
      return semver.inc(current, 'major');
    } else if (this.settings.minor) {
      return semver.inc(current, 'minor')
    } else {
      return semver.inc(current, 'patch');
    }
  }

  async calculateNextVersion() {
    // Get the latest tag
    const latestTag = this.getLatestTag();

    // Calculate the new version
    const newVersion = await this.incrementVersion(latestTag);

    return this.buildTag(newVersion)
  }
}
