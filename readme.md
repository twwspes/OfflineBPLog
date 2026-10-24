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
`package.json`, then run `npm ci`. Version management stays
local: `eas.json` uses `appVersionSource: "local"`.

Use Conventional Commits, for example `fix: correct date filtering` or
`feat: add monthly summaries`. These generate release notes and suggest patch or
minor versions; a marked breaking change suggests a major version.

Start from a clean, committed `main` branch that is up to date with the remote:

```sh
npm run release:preview -- minor
npm run release -- minor
```

Use `patch`, `minor`, or `major`, or omit the argument to use the interactive
version selection. Preview shows planned changes without writing files; run
`npm run check` and `npm test` separately to validate before previewing.
The actual release runs these checks, updates `package.json`, `package-lock.json`,
`expo.version`, and `expo.runtimeVersion`, increments both local build numbers,
updates `CHANGELOG.md`, and prompts to commit, tag, push, and create a **draft**
GitHub release. npm publishing is disabled. Review generated public release notes
before publishing the draft.

GitHub release creation requires `GITHUB_TOKEN` in your shell environment with
access to create releases in the repository. Git push uses your existing Git
credentials. Keep tokens and signing credentials outside tracked files; never
paste their values into documentation or commits.

Build locally, one platform at a time:

```sh
eas build --local --platform ios --profile production
eas build --local --platform android --profile production
```

Test the builds, submit through the usual store process, and publish the GitHub
draft when the release is available. Release preparation does not run EAS builds,
submit to stores, or publish EAS Updates.

For a replacement build of the **same app version**:

```sh
npm run build:bump -- --dry-run
npm run build:bump
git add app.json
git commit -m "chore: increment build numbers"
```

Then build again. This increments both platform counters without changing the app
version or generating another release. Do not also bump manually before a normal
`npm run release`, which already increments them.

The runtime version follows the app version. Native compatibility changes require
a new app version and store build before publishing matching EAS Updates. Update
channels are maintained separately: review the production channel in `eas.json`
when planning a release; these commands deliberately leave it unchanged.

The first generated changelog entry uses the available history since the repository
restart; earlier handwritten release records remain below it. The version in
`package.json` is the starting point even when there are no release tags yet.
