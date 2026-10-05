import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const manualCasesRoot = path.resolve('docs/user-manual/cases');
const caseGroups = fs.readdirSync(manualCasesRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name);

const getProcedureFiles = group => fs.readdirSync(path.join(manualCasesRoot, group))
  .filter(fileName => /^\d{2}-cap-.*\.md$/.test(fileName))
  .sort();

describe('enumeración de procedimientos del manual', () => {
  it.each(caseGroups)('mantiene nombres, títulos e índice consecutivos en %s', group => {
    const procedureFiles = getProcedureFiles(group);
    const index = fs.readFileSync(path.join(manualCasesRoot, group, 'index.md'), 'utf8');
    const firstNumber = group === 'catalogs' ? 2 : 1;
    let previousIndexPosition = -1;

    procedureFiles.forEach((fileName, offset) => {
      const expectedNumber = firstNumber + offset;
      const fileNumber = Number(fileName.slice(0, 2));
      const content = fs.readFileSync(path.join(manualCasesRoot, group, fileName), 'utf8');
      const headingNumber = Number(content.match(/^# (\d+)\. /m)?.[1]);
      const indexPosition = index.indexOf(`(${ fileName })`);

      expect(fileNumber, fileName).toBe(expectedNumber);
      expect(headingNumber, fileName).toBe(expectedNumber);
      expect(indexPosition, fileName).toBeGreaterThan(previousIndexPosition);

      previousIndexPosition = indexPosition;
    });
  });
});
