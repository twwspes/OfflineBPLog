# Overview
BP Log was created out of the need of my mum to log her daily blood pressure on her smartphone.  I had fed up with the currently available apps with "advanced" fancy features bombarded with ads.  All we need is just a simple log which store all blood pressure records on the phone, with the option to output the data via email.  In short, an app never compromises the privacy and security. 

# Localised Languages
The app currently supports English, French, Spanish, Traditional Chinese and Simplified Chinese.  All of the localisation work is done by me alone.  Some of the translations may not be accurate in the perspective of native speakers.  You are more than welcome to suggest any improvements on the languages.

# Correctness checks

Run `npm run test:records` for record editing, spreadsheet import/export,
category calculations, pagination, and deletion error recovery. Run `npm test`
for all tests. Tests use synthetic records and an in-memory SQLite database;
they do not access the app's stored records. CI and release preparation run them.

Run `npm run benchmark:charts` to compare the previous and optimized chart
queries on 1,000, 5,000, and 20,000 synthetic records. The benchmark checks that
their results match. Timings use in-memory SQLite and exclude the mobile native
bridge; they are not measurements of dashboard load time on a phone.

New spreadsheet exports include an optional `Milliseconds` column to retain
timestamp precision. Older spreadsheets still import using matching within each
second. Keep the new column when available, especially for records saved within
the same second.

# Expo managed workflow
To simplify the maintenance process, I choose to apply expo over react-native and let expo to manage the building process.  This allows me to focus more time on the matters of user experience rather than dealing with tangled messy npm packages.  One shortcoming is that the compiled app tends to be bigger in size (around 30 MB, compared with native apps of similar category with just a few MB).

# Versions and local releases

Use Node.js 24.15+ (recommended), 22.22.2+, or 26+ as specified in
`package.json`, then run `npm ci`. EAS uses local app versions and build numbers.
Use Conventional Commits such as `feat: add monthly summaries` and
`fix: correct date filtering` to generate release notes.

## 1. Prepare a release branch

Start from an up-to-date `main` with a clean working tree. Choose the intended
version, for example:

```sh
git switch -c release/2.7.0
npm run release:preview -- 2.7.0
npm run release:prepare -- 2.7.0
```

Preparation runs checks and tests, synchronizes `package.json`, its lockfile,
`expo.version`, and `expo.runtimeVersion`, increments both platform build numbers,
updates `CHANGELOG.md`, and prompts to make a local commit. It creates no tag or
GitHub release and does not push. The version must match the branch name and be
newer than the current app version. `npm run release` is an alias for preparation.
Commit the preparation changes before building if you decline its commit prompt.

Preview does not modify files. Run `npm run check` and `npm test` separately when
you want validation before previewing. Push the release branch normally whenever
you want a remote backup.

## 2. Build and test locally

```sh
eas build --local --platform ios --profile production
eas build --local --platform android --profile production
```

Install and test the builds, including through TestFlight as appropriate. These
commands do not submit to stores. Update channels remain a separate decision:
review the production channel in `eas.json` before building a new release.

## 3. Prepare replacement builds

Commit any fixes first, then increment only the build numbers and refresh notes:

```sh
npm run build:bump -- --dry-run
npm run build:bump
npm run release:notes
git add app.json CHANGELOG.md
git commit -m "chore: prepare replacement build"
```

Build and test again. The app version stays the same while both platform build
numbers increase. Do not repeat `release:prepare` for the same release.
`release:notes` replaces the current version's entry rather than duplicating it;
older handwritten release records are preserved. Review the generated public notes.
If you already bumped this release's version manually, skip preparation and use
`release:notes` after ensuring the package, lockfile, app, and runtime versions all
match the release branch.

## 4. Finalize after the store release

Run finalization on the clean release-branch commit used for the approved build:

```sh
npm run release:finalize:preview
npm run release:finalize
```

Finalization checks versions and notes, runs checks and tests, and prompts to tag
that exact commit, push the release branch and tag, and create a **draft** GitHub
release. It does not change files, create a new commit, or increment versions or
build numbers. Stale notes must be refreshed, reviewed, and committed before the
final build. Review and publish the GitHub draft after the store release.

Automated GitHub release creation uses `GITHUB_TOKEN` from your shell environment.
Without it, release-it can open GitHub's release form instead. Git push uses your
existing Git credentials. Keep token values and signing credentials outside
tracked files and documentation. npm publishing is disabled.

## 5. Merge back to main

Merge the released branch through your usual pull-request process. Use a merge
commit to preserve the tested, tagged release commit in `main`'s history. The next
release starts from the updated `main`; build numbers continue increasing.

The runtime version follows the app version. Native compatibility changes require
a new app version and store build before publishing matching EAS Updates. Release
scripts do not build apps, submit to stores, publish EAS Updates, or merge branches.
