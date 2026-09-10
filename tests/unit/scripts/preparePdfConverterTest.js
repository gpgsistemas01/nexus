import { describe, expect, it, vi } from 'vitest';
import {
  preparePdfConverter,
  preparePdfConverterEnvironment
} from '../../../scripts/preparePdfConverter.js';

const successfulResult = { status: 0 };
const missingResult = { error: { code: 'ENOENT' }, status: null };

describe('preparePdfConverter', () => {
  it('removes Python overrides from the LibreOffice environment without mutating the source', () => {
    const environment = {
      PATH: '/usr/bin',
      PythonHome: '/embedded/python',
      PYTHONPATH: '/custom/modules'
    };

    expect(preparePdfConverterEnvironment(environment)).toEqual({ PATH: '/usr/bin' });
    expect(environment).toEqual({
      PATH: '/usr/bin',
      PythonHome: '/embedded/python',
      PYTHONPATH: '/custom/modules'
    });
  });

  it('reuses the configured converter without attempting an installation', () => {
    const runCommand = vi.fn(() => successfulResult);
    const environment = { PATH: '/usr/bin', PYTHONHOME: '/embedded/python' };

    const converter = preparePdfConverter({
      configuredConverter: '/opt/libreoffice/soffice',
      environment,
      runCommand
    });

    expect(converter).toBe('/opt/libreoffice/soffice');
    expect(runCommand).toHaveBeenCalledOnce();
    expect(runCommand).toHaveBeenCalledWith('/opt/libreoffice/soffice', ['--version'], {
      encoding: 'utf8',
      env: { PATH: '/usr/bin' },
      timeout: 15000,
      windowsHide: true
    });
  });

  it('uses the console companion when the configured Windows converter points to soffice.exe', () => {
    const graphicalExecutable = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';
    const consoleExecutable = 'C:\\Program Files\\LibreOffice\\program\\soffice.com';
    const runCommand = vi.fn(command => command === consoleExecutable ? successfulResult : missingResult);

    const converter = preparePdfConverter({
      configuredConverter: graphicalExecutable,
      platform: 'win32',
      runCommand
    });

    expect(converter).toBe(consoleExecutable);
    expect(runCommand).toHaveBeenCalledOnce();
  });

  it('installs LibreOffice with apt-get when soffice is missing on Linux', () => {
    let sofficeChecks = 0;
    const runCommand = vi.fn((command, argumentsList) => {
      if (command === 'soffice') {
        sofficeChecks += 1;
        return sofficeChecks === 1 ? missingResult : successfulResult;
      }
      if (command === 'apt-get' && argumentsList[0] === '--version') return successfulResult;
      return successfulResult;
    });

    const converter = preparePdfConverter({
      platform: 'linux',
      runCommand,
      getUserId: () => 0
    });

    expect(converter).toBe('soffice');
    expect(runCommand).toHaveBeenCalledWith(
      'apt-get',
      ['update'],
      { stdio: 'inherit', windowsHide: true }
    );
    expect(runCommand).toHaveBeenCalledWith(
      'apt-get',
      ['install', '-y', 'libreoffice'],
      { stdio: 'inherit', windowsHide: true }
    );
  });

  it('uses the console executable and a non-interactive installation on Windows', () => {
    const consoleExecutable = 'C:\\Program Files\\LibreOffice\\program\\soffice.com';
    let converterChecks = 0;
    const runCommand = vi.fn((command) => {
      if (command === consoleExecutable) {
        converterChecks += 1;
        return converterChecks === 1 ? missingResult : successfulResult;
      }
      if (command === 'soffice.com') return missingResult;
      return successfulResult;
    });

    const converter = preparePdfConverter({
      environment: { ProgramFiles: 'C:\\Program Files' },
      platform: 'win32',
      runCommand
    });

    expect(converter).toBe(consoleExecutable);
    expect(runCommand).toHaveBeenCalledWith('winget', [
      'install',
      '--id',
      'TheDocumentFoundation.LibreOffice',
      '--exact',
      '--silent',
      '--disable-interactivity',
      '--accept-package-agreements',
      '--accept-source-agreements'
    ], { stdio: 'inherit', windowsHide: true });
  });

  it('reports when an explicitly configured converter is unavailable', () => {
    const runCommand = vi.fn(() => missingResult);

    expect(() => preparePdfConverter({
      configuredConverter: '/missing/soffice',
      runCommand
    })).toThrow('DOCS_PDF_CONVERTER');
    expect(runCommand).toHaveBeenCalledOnce();
  });
});
