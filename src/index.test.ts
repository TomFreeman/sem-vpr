import { shouldTagPrerelease, buildSettings, shouldSkipRelease } from "./index";
import { Config, getConfig } from "./config";

describe("Tag prerelease", () => {
    test("Should tag prerelease is true when configured even without labels", async () => {
        const config = {
            tagPrerelease: true,
        } as Config;

        const out = shouldTagPrerelease([], config);
        expect(out).toBe(true);
    });

    test("Should tag prerelease is true when configured and label is present", async () => {
        const config = {
            tagPrerelease: true,
        } as Config;

        const out = shouldTagPrerelease(["prerelease"], config);
        expect(out).toBe(true);
    });

    test("Should tag prerelease is false when not configured and label is not present", async () => {
        const config = {
            tagPrerelease: false,
            prereleaseLabel: "prerelease",
        } as Config;

        const out = shouldTagPrerelease([], config);
        expect(out).toBe(false);
    });

    test("Should tag prerelease is true if label is present", async () => {
        const config = {
            tagPrerelease: false,
            prereleaseLabel: "prerelease",
        } as Config;

        const out = shouldTagPrerelease(["prerelease"], config);
        expect(out).toBe(true);
    });

    test("Should skip tagging if skip-release label is present", async () => {
        const config = {
            tagPrerelease: false,
            skipReleaseLabel: "skip-release",
        } as Config;

        const out = shouldSkipRelease(["skip-release"], config);
        expect(out).toBe(true);
    });

    test("Should not skip tagging if skip-release label is absent", async () => {
        const config = {
            tagPrerelease: false,
            skipReleaseLabel: "skip-release",
        } as Config;

        const out = shouldSkipRelease(["some-other-tag"], config);
        expect(out).toBe(false);
    });
});

describe("Build Settings", () => {
    test("Should build settings", async () => {
        const config = {} as Config;

        const out = buildSettings([], config, "main");

        expect(out).toEqual({
            prefix: 'v',
            major: undefined,
            minor: undefined,
            suffix: undefined,
        });
    });

    test("Should build settings with major", async () => {
        const config = {
            majorLabel: "major",
        } as Config;

        const out = buildSettings(["major"], config, "main");

        expect(out).toEqual({
            prefix: 'v',
            major: true,
            minor: undefined,
            suffix: undefined,
        });
    });

    test("Should build settings with minor", async () => {
        const config = {
            minorLabel: "minor",
        } as Config;

        const out = buildSettings(["minor"], config, "main");

        expect(out).toEqual({
            prefix: 'v',
            major: undefined,
            minor: true,
            suffix: undefined,
        });
    });

    test("Only sets major if both major and minor labels are present", async () => {
        const config = {
            majorLabel: "major",
            minorLabel: "minor",
        } as Config;

        const out = buildSettings(["major", "minor"], config, "main");

        expect(out).toEqual({
            prefix: 'v',
            major: true,
            minor: undefined,
            suffix: undefined,
        });
    });
});
