import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ConventionalChangelog } from 'conventional-changelog';

import { releaseGuard } from './release-guard.mts';

const sections = (text: string) => [
  ...text.matchAll(
    /^#{1,2} (?:\[v?(\d+\.\d+\.\d+)\]|v?(\d+\.\d+\.\d+))(?=[\s(]|$).*$/gm,
  ),
];

export const currentReleaseNotes = (text: string, version: string) => {
  const section = sections(text).find(
    (match) => (match[1] ?? match[2]) === version,
  );
  if (!section) return undefined;
  const start = section.index;
  const rest = text.slice(start + section[0].length);
  const next = rest.search(
    /^(?:#{1,2} (?:\[?v?\d+\.\d+\.\d+)|v\d+\.\d+\.\d+ \(version code)/m,
  );
  const end = next < 0 ? text.length : start + section[0].length + next;
  return { start, end, text: text.slice(start, end).trim() };
};

export const replaceReleaseNotes = (
  previous: string,
  version: string,
  notes: string,
) => {
  let remaining = previous;
  let current = currentReleaseNotes(remaining, version);
  while (current) {
    remaining =
      remaining.slice(0, current.start) + remaining.slice(current.end);
    current = currentReleaseNotes(remaining, version);
  }
  remaining = remaining.replace(/^# Changelog\s*/, '').trim();
  return `# Changelog\n\n${notes.trim()}${remaining ? `\n\n${remaining}` : ''}\n`;
};

export const generateReleaseNotes = async (directory: string) => {
  const { version } = releaseGuard(directory, 'notes');
  const previous = readFileSync(resolve(directory, 'CHANGELOG.md'), 'utf8');
  const current = currentReleaseNotes(previous, version)?.text;
  // Keep the entry date stable while refreshing notes during testing.
  const date = current?.split('\n')[0].match(/\((\d{4}-\d{2}-\d{2})\)/)?.[1];
  const tags = execFileSync(
    'git',
    ['tag', '--merged', 'HEAD', '--sort=-version:refname'],
    { cwd: directory, encoding: 'utf8' },
  )
    .trim()
    .split('\n');
  const previousTag = tags.find(
    (tag) => /^v\d+\.\d+\.\d+$/.test(tag) && tag !== `v${version}`,
  );
  const generator = new ConventionalChangelog(directory)
    .readPackage()
    .loadPreset('conventionalcommits')
    .tags({ prefix: 'v' })
    .options({ releaseCount: 1 })
    .context({
      version,
      currentTag: `v${version}`,
      previousTag,
      ...(date ? { date } : {}),
    })
    .commits({ from: previousTag, to: 'HEAD' });
  const remote = execFileSync('git', ['remote'], {
    cwd: directory,
    encoding: 'utf8',
  }).split(/\s+/);
  if (remote.includes('origin')) generator.readRepository();
  let notes = '';
  for await (const chunk of generator.write()) notes += chunk;
  return { version, previous, notes: notes.trim() };
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2);
    if (
      args.length > 1 ||
      args.some((arg) => !['--check', '--print'].includes(arg))
    )
      throw new Error('Usage: npm run release:notes -- [--check | --print]');
    const { version, previous, notes } = await generateReleaseNotes(
      process.cwd(),
    );
    if (args.includes('--print')) console.log(notes);
    else if (args.includes('--check')) {
      if (currentReleaseNotes(previous, version)?.text !== notes)
        throw new Error(
          'Release notes are stale. Run npm run release:notes, review and commit the notes before your final build.',
        );
    } else {
      writeFileSync(
        resolve(process.cwd(), 'CHANGELOG.md'),
        replaceReleaseNotes(previous, version, notes),
      );
      console.log(`Updated release notes for ${version}.`);
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Release notes failed.',
    );
    process.exitCode = 1;
  }
}
