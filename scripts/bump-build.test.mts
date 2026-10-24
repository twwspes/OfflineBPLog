import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { bumpBuild } from './bump-build.mts';

await test('preview is read-only; bump preserves version, channel-independent settings, and unequal build numbers', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bp-log-version-test-'));
  try {
    const config = {
      expo: {
        version: '2.6.0',
        runtimeVersion: '2.6.0',
        ios: { buildNumber: '31', supportsTablet: true },
        android: { versionCode: 34, package: 'example.app' },
      },
    };
    const appPath = join(directory, 'app.json');
    const original = JSON.stringify(config);
    writeFileSync(appPath, original);
    writeFileSync(
      join(directory, 'package.json'),
      JSON.stringify({ version: '2.6.0' }),
    );
    assert.deepEqual(bumpBuild(directory, true), { ios: '32', android: 35 });
    assert.equal(readFileSync(appPath, 'utf8'), original);
    bumpBuild(directory);
    config.expo.ios.buildNumber = '32';
    config.expo.android.versionCode = 35;
    assert.deepEqual(JSON.parse(readFileSync(appPath, 'utf8')), config);

    for (const invalid of ['31.1', 'invalid', '9007199254740991']) {
      config.expo.ios.buildNumber = invalid;
      const before = JSON.stringify(config);
      writeFileSync(appPath, before);
      assert.throws(() => bumpBuild(directory), /ios.buildNumber/);
      assert.equal(readFileSync(appPath, 'utf8'), before);
    }
    config.expo.ios.buildNumber = '32';
    config.expo.android.versionCode = 2100000000;
    writeFileSync(appPath, JSON.stringify(config));
    assert.throws(() => bumpBuild(directory), /android.versionCode/);
    config.expo.version = '2.7.0';
    writeFileSync(appPath, JSON.stringify(config));
    assert.throws(() => bumpBuild(directory), /must match/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
