import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { describe, expect, it } from 'vitest';

const collectTestFiles = (directory) => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? collectTestFiles(path) : [path];
  })
  .filter((path) => path.endsWith('Test.js'));

describe('controller test organization', () => {
  it('no conserva carpetas ni nombres de pruebas organizados por service', () => {
    const invalidPaths = collectTestFiles('tests')
      .map((path) => relative('.', path))
      .filter((path) => /(^|[/\\])services?([/\\]|[^/\\]*Test\.js$)/i.test(path));

    expect(invalidPaths).toEqual([]);
  });
});
