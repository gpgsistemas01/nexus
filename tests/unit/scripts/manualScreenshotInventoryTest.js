import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

import { describe, expect, it } from 'vitest';

const script = path.resolve('scripts/captureManualScreenshots.js');
const listInventory = (...argumentsList) => execFileSync(
  process.execPath,
  [script, ...argumentsList, '--list'],
  { encoding: 'utf8' }
);

describe('manual screenshot inventory', () => {
  it('lists the complete inventory without requiring a browser or credentials', () => {
    const output = listInventory();

    expect(output).toContain('| 1 | almacen | `CAP-AUT-01-LOGIN` |');
    expect(output).toContain('| 110 | sistemas | `CAP-ERR-404-SISTEMAS-NOT-FOUND` |');
  });

  it.each(['almacen', 'sistemas'])('limits the inventory to the %s area', area => {
    const output = listInventory('--area', area);
    const rows = output.split('\n').filter(line => /^\| \d+ \|/.test(line));

    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(line => line.includes(`| ${ area } |`))).toBe(true);
  });
});
