import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { releaseGuard } from './release-guard.mts';
import { currentReleaseNotes, replaceReleaseNotes } from './release-notes.mts';

const project = fileURLToPath(new URL('../', import.meta.url));

await test('refreshing release notes replaces duplicate entries and preserves older handwritten history', () => {
  const legacy = 'v2.6.0 (version code 31) - published and released\n';
  const old =
    '# Changelog\n\n## [2.7.0] (2026-01-01)\n\nOld notes\n\n## [2.7.0] (2026-01-01)\n\nDuplicate\n\n' +
    legacy;
  const notes =
    '## [2.7.0] (2026-01-01)\n\n### Bug Fixes\n\n* Fixed date handling';
  const updated = replaceReleaseNotes(old, '2.7.0', notes);
  assert.equal(updated.match(/## \[2\.7\.0\]/g)?.length, 1);
  assert.ok(updated.endsWith(legacy));
  assert.equal(currentReleaseNotes(updated, '2.7.0')?.text, notes);
  assert.equal(replaceReleaseNotes(updated, '2.7.0', notes), updated);
});

await test('release branch workflow prepares once, retries builds and finalizes the exact tested commit without modifying files', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'bp-log-release-flow-'));
  const directory = join(temporary, 'checkout');
  const remote = join(temporary, 'remote.git');
  mkdirSync(directory);
  const env = {
    ...process.env,
    CI: 'true',
    HUSKY: '0',
    GITHUB_TOKEN: '',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
  };
  const command = (program: string, args: string[], allowFailure = false) => {
    const result = spawnSync(program, args, {
      cwd: directory,
      env,
      encoding: 'utf8',
    });
    if (result.error) throw result.error;
    if (!allowFailure)
      assert.equal(
        result.status,
        0,
        `${program} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`,
      );
    return {
      status: result.status,
      output: result.stdout.trim(),
      error: result.stderr.trim(),
    };
  };
  const git = (...args: string[]) => command('git', args).output;
  const read = (name: string) => readFileSync(join(directory, name), 'utf8');
  const snapshot = () =>
    ['package.json', 'package-lock.json', 'app.json', 'CHANGELOG.md'].map(read);
  const release = (args: string[], allowFailure = false) =>
    command(
      process.execPath,
      [
        join(project, 'node_modules/release-it/bin/release-it.js'),
        ...args,
        '--ci',
      ],
      allowFailure,
    );
  try {
    mkdirSync(join(directory, 'scripts'));
    for (const name of ['.release-it.json', '.release-it.finalize.json'])
      cpSync(join(project, name), join(directory, name));
    for (const name of [
      'bump-build.mts',
      'release-guard.mts',
      'release-notes.mts',
    ])
      cpSync(join(project, 'scripts', name), join(directory, 'scripts', name));
    symlinkSync(
      join(project, 'node_modules'),
      join(directory, 'node_modules'),
      'dir',
    );
    writeFileSync(join(directory, '.gitignore'), 'node_modules/\n');
    writeFileSync(
      join(directory, 'package.json'),
      JSON.stringify(
        {
          name: 'release-fixture',
          version: '2.6.0',
          private: true,
          scripts: {
            check: 'node --version',
            test: 'node --version',
            'build:bump': 'node scripts/bump-build.mts',
            'release:notes': 'node scripts/release-notes.mts',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(directory, 'package-lock.json'),
      JSON.stringify({
        name: 'release-fixture',
        version: '2.6.0',
        lockfileVersion: 3,
        packages: { '': { name: 'release-fixture', version: '2.6.0' } },
      }),
    );
    writeFileSync(
      join(directory, 'app.json'),
      JSON.stringify({
        expo: {
          version: '2.6.0',
          runtimeVersion: '2.6.0',
          ios: { buildNumber: '31' },
          android: { versionCode: 31 },
        },
      }),
    );
    writeFileSync(
      join(directory, 'CHANGELOG.md'),
      'v2.6.0 (version code 31) - published and released\n',
    );
    git('init', '-b', 'main');
    git('config', 'user.name', 'Release Workflow Test');
    git('config', 'user.email', 'release-test@example.invalid');
    git('init', '--bare', '--initial-branch=main', remote);
    const remoteUrl = 'https://github.com/example/release-fixture.git';
    git('remote', 'add', 'origin', remoteUrl);
    git('config', `url.${pathToFileURL(remote).href}.insteadOf`, remoteUrl);
    git('add', '.');
    git('commit', '-m', 'chore: baseline');
    git('tag', '-a', 'v2.6.0', '-m', 'Baseline');
    git('push', '-u', 'origin', 'main', '--tags');
    assert.throws(
      () => releaseGuard(directory, 'prepare'),
      /release\/<version>/,
    );
    git('switch', '-c', 'release/2.7.0');
    assert.throws(() => releaseGuard(directory, 'finalize'), /must match/);
    writeFileSync(join(directory, 'feature.txt'), 'New feature\n');
    git('add', '.');
    git('commit', '-m', 'feat: add monthly summary');
    const baseline = snapshot();
    release(['2.7.0', '--dry-run']);
    assert.deepEqual(snapshot(), baseline);
    assert.equal(release(['2.8.0'], true).status, 1);
    assert.deepEqual(snapshot(), baseline);
    release(['2.7.0']);
    const pkg = JSON.parse(read('package.json')) as { version: string };
    const app = JSON.parse(read('app.json')) as {
      expo: {
        version: string;
        runtimeVersion: string;
        ios: { buildNumber: string };
        android: { versionCode: number };
      };
    };
    assert.equal(pkg.version, '2.7.0');
    assert.equal(app.expo.version, '2.7.0');
    assert.equal(app.expo.runtimeVersion, '2.7.0');
    assert.equal(app.expo.ios.buildNumber, '32');
    assert.equal(app.expo.android.versionCode, 32);
    assert.ok(read('CHANGELOG.md').includes('add monthly summary'));
    assert.equal(git('status', '--porcelain'), '');
    assert.equal(git('tag', '--list', 'v2.7.0'), '');
    assert.equal(
      command(
        'git',
        [
          '--git-dir',
          remote,
          'show-ref',
          '--verify',
          '--quiet',
          'refs/heads/release/2.7.0',
        ],
        true,
      ).status,
      1,
    );
    assert.throws(() => releaseGuard(directory, 'prepare'), /already prepared/);

    writeFileSync(join(directory, 'feature.txt'), 'Fixed feature\n');
    git('add', '.');
    git('commit', '-m', 'fix: correct sample date handling');
    const finalizeArgs = [
      '--config',
      '.release-it.finalize.json',
      '--no-increment',
      '--no-github.release',
    ];
    const stale = release(finalizeArgs, true);
    assert.equal(
      stale.status,
      1,
      'Stale release notes must stop finalization.',
    );
    assert.match(stale.error, /Release notes are stale/);
    command(process.execPath, ['scripts/bump-build.mts']);
    command(process.execPath, ['scripts/release-notes.mts']);
    const notes = read('CHANGELOG.md');
    command(process.execPath, ['scripts/release-notes.mts']);
    assert.equal(read('CHANGELOG.md'), notes);
    assert.ok(notes.includes('correct sample date handling'));
    assert.equal(notes.match(/#{1,2} \[?2\.7\.0/g)?.length, 1);
    git('add', '.');
    git('commit', '-m', 'chore: prepare replacement build');
    const testedCommit = git('rev-parse', 'HEAD');
    const testedFiles = snapshot();
    const override = release(
      ['--config', '.release-it.finalize.json', '2.8.0', '--no-github.release'],
      true,
    );
    assert.equal(override.status, 1);
    assert.match(override.error, /Finalization must not change/);
    assert.deepEqual(snapshot(), testedFiles);
    release([...finalizeArgs, '--dry-run']);
    assert.deepEqual(snapshot(), testedFiles);
    assert.equal(git('tag', '--list', 'v2.7.0'), '');
    release(finalizeArgs);
    assert.deepEqual(
      snapshot(),
      testedFiles,
      'Finalization must not change any version, build or changelog file.',
    );
    assert.equal(git('rev-parse', 'HEAD'), testedCommit);
    assert.equal(git('rev-parse', 'v2.7.0^{}'), testedCommit);
    assert.equal(
      command('git', ['--git-dir', remote, 'rev-parse', 'v2.7.0^{}']).output,
      testedCommit,
    );
    assert.equal(
      command('git', [
        '--git-dir',
        remote,
        'rev-parse',
        'refs/heads/release/2.7.0',
      ]).output,
      testedCommit,
    );
    const finalApp = JSON.parse(read('app.json')) as typeof app;
    assert.equal(finalApp.expo.ios.buildNumber, '33');
    assert.equal(finalApp.expo.android.versionCode, 33);
    git('switch', 'main');
    git('merge', '--no-ff', 'release/2.7.0', '-m', 'Merge released version');
    git('merge-base', '--is-ancestor', testedCommit, 'HEAD');
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
