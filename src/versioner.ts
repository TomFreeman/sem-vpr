export type Settings = {
  major: boolean,
  minor: boolean,
  prefix: string,
  suffix: string,
  noPrefix: boolean,
}

// Semver regex, anything that contains three numbers seperated by dots
export const isSemVer = /^[\w]*(\d+\.)(\d+\.)(\d+)($|-[\w]*)/;

// Versioner wraps the logic for calculating the next version
export class Versioner {
  tags: string[];
  settings: Settings;

  constructor(tags, settings) {
    settings = settings || {} as Settings;

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
    const semverTags = (this.tags || []).filter(tag => isSemVer.test(tag));

    if (!semverTags || semverTags.length === 0) {
      console.log('No tags found, using 0.0.0');
      return '0.0.0';
    } else {
      // Filter out all the prerelease tags and sort them
      var filteredTags = this.tags.filter(tag => !tag.includes('-'));
      filteredTags.sort();
      var tag = filteredTags[filteredTags.length - 1];

      if (tag.startsWith(this.settings.prefix)) {
        tag = tag.substring(this.settings.prefix.length);
      }

      return tag
    }
  }

  incrementVersion(latestTag) {
    // Split the latest tag into its parts
    const parts = latestTag.split('.');
    const major = parseInt(parts[0]);
    const minor = parseInt(parts[1]);
    const patch = parseInt(parts[2]);

    // Increment the version
    if (this.settings.major) {
      return `${major + 1}.${minor}.${patch}`;
    } else if (this.settings.minor) {
      return `${major}.${minor + 1}.${patch}`;
    } else {
      return `${major}.${minor}.${patch + 1}`;
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
