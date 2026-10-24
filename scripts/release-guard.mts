import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export type ReleaseMode = 'prepare' | 'notes' | 'finalize';

export const releaseGuard = (
  directory: string,
  mode: ReleaseMode,
  proposedVersion?: string,
) => {
  const read = (name: string) =>
    JSON.parse(readFileSync(resolve(directory, name), 'utf8')) as Record<
      string,
      unknown
    >;
  const pkg = read('package.json');
  const app = read('app.json').expo as {
    version: string;
    runtimeVersion: string;
    ios: { buildNumber: string };
    android: { versionCode: number };
  };
  const lock = read('package-lock.json') as {
    version: string;
    packages: Record<string, { version: string }>;
  };
  const version = pkg.version;
  if (typeof version !== 'string' || !stableVersion.test(version))
    throw new Error('App version must be a stable x.y.z version.');
  if (
    [
      app.version,
      app.runtimeVersion,
      lock.version,
      lock.packages[''].version,
    ].some((value) => value !== version)
  ) {
    throw new Error('Package, lockfile, app and runtime versions must match.');
  }
  if (
    !/^[1-9]\d*$/.test(app.ios.buildNumber) ||
    !Number.isSafeInteger(Number(app.ios.buildNumber)) ||
    !Number.isInteger(app.android.versionCode) ||
    app.android.versionCode < 1 ||
    app.android.versionCode > 2100000000
  ) {
    throw new Error('Invalid local iOS or Android build number.');
  }
  const git = (...args: string[]) =>
    execFileSync('git', args, {
      cwd: directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  const branch = git('branch', '--show-current');
  const targetVersion = branch.startsWith('release/')
    ? branch.slice('release/'.length)
    : '';
  if (!stableVersion.test(targetVersion))
    throw new Error(
      'Use a release/<version> branch, for example release/2.7.0.',
    );
  if (mode === 'prepare') {
    const current = version.split('.').map(BigInt);
    const target = targetVersion.split('.').map(BigInt);
    const difference = target.findIndex(
      (value, index) => value !== current[index],
    );
    if (difference === -1 || target[difference] < current[difference]) {
      throw new Error(
        'This release version is already prepared or is older. Use build:bump for another build.',
      );
    }
    if (proposedVersion && proposedVersion !== targetVersion)
      throw new Error(`The selected version must match ${branch}.`);
  } else if (targetVersion !== version) {
    throw new Error('The release branch must match the prepared app version.');
  } else if (proposedVersion && proposedVersion !== version) {
    throw new Error('Finalization must not change the prepared app version.');
  }
  const tag = `v${targetVersion}`;
  if (git('tag', '--list', tag)) {
    if (mode === 'prepare')
      throw new Error(
        'This release tag already exists. Choose a new release version.',
      );
    if (
      mode === 'finalize' &&
      git('rev-parse', `${tag}^{}`) !== git('rev-parse', 'HEAD')
    ) {
      throw new Error('The release tag already points to a different commit.');
    }
  }
  return { version, branch, targetVersion };
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const [mode, version, ...extra] = process.argv.slice(2);
    if (!['prepare', 'notes', 'finalize'].includes(mode) || extra.length)
      throw new Error('Usage: release-guard prepare|notes|finalize [version]');
    releaseGuard(process.cwd(), mode as ReleaseMode, version);
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Release validation failed.',
    );
    process.exitCode = 1;
  }
}
