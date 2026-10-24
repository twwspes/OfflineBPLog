import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

interface AppConfig {
  expo: {
    version: string;
    runtimeVersion: string;
    ios: { buildNumber: string };
    android: { versionCode: number };
  };
}

// Validate both platforms before writing, so an invalid value cannot cause a partial bump.
export const nextBuildNumbers = (config: AppConfig) => {
  const iosBuild = config.expo.ios.buildNumber;
  const androidBuild = config.expo.android.versionCode;
  if (
    typeof iosBuild !== 'string' ||
    !/^[1-9]\d*$/.test(iosBuild) ||
    !Number.isSafeInteger(Number(iosBuild)) ||
    !Number.isSafeInteger(Number(iosBuild) + 1)
  ) {
    throw new Error(
      'ios.buildNumber must be a positive integer string that can be incremented.',
    );
  }
  if (
    !Number.isInteger(androidBuild) ||
    androidBuild < 1 ||
    androidBuild >= 2100000000
  ) {
    throw new Error(
      'android.versionCode must be an integer from 1 to 2099999999.',
    );
  }
  return { ios: String(Number(iosBuild) + 1), android: androidBuild + 1 };
};

export const bumpBuild = (directory: string, checkOnly = false) => {
  const appPath = resolve(directory, 'app.json');
  const config = JSON.parse(readFileSync(appPath, 'utf8')) as AppConfig;
  const pkg = JSON.parse(
    readFileSync(resolve(directory, 'package.json'), 'utf8'),
  ) as { version: string };
  if (
    config.expo.version !== pkg.version ||
    config.expo.runtimeVersion !== pkg.version
  ) {
    throw new Error(
      'package.json version, expo.version, and expo.runtimeVersion must match.',
    );
  }
  const next = nextBuildNumbers(config);
  if (!checkOnly) {
    config.expo.ios.buildNumber = next.ios;
    config.expo.android.versionCode = next.android;
    writeFileSync(appPath, `${JSON.stringify(config, null, 2)}\n`);
  }
  return next;
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--check' && arg !== '--dry-run')) {
      throw new Error('Usage: npm run build:bump -- [--check | --dry-run]');
    }
    const preview = args.length > 0;
    const next = bumpBuild(process.cwd(), preview);
    console.log(
      `${preview ? 'Next' : 'Updated'} build numbers: iOS ${next.ios}, Android ${next.android}`,
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Build-number update failed.',
    );
    process.exitCode = 1;
  }
}
