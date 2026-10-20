import { describe, expect, it, vi } from 'vitest';
import { prepareMermaidCli } from '../../../scripts/prepareMermaidCli.js';
import { MERMAID_CLI_VERSION, MERMAID_VERSION } from '../../../scripts/mermaidExportUtils.js';

describe('prepareMermaidCli', () => {
  it('reuses the installed executable without invoking npm', () => {
    const runCommand = vi.fn();

    const executable = prepareMermaidCli({
      executable: '/workspace/node_modules/@mermaid-js/mermaid-cli/src/cli.js',
      runCommand,
      fileExists: () => true,
      isCompatible: () => true
    });

    expect(executable).toContain('mermaid-cli');
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('installs Mermaid CLI without changing the dependency manifests', () => {
    let availabilityChecks = 0;
    const fileExists = vi.fn(() => {
      availabilityChecks += 1;
      return availabilityChecks > 1;
    });
    const runCommand = vi.fn(() => ({ status: 0 }));

    prepareMermaidCli({
      executable: '/workspace/node_modules/@mermaid-js/mermaid-cli/src/cli.js',
      environment: {},
      platform: 'linux',
      runCommand,
      fileExists,
      isCompatible: () => true
    });

    expect(runCommand).toHaveBeenCalledWith('npm', [
      'install',
      '--no-save',
      '--package-lock=false',
      `@mermaid-js/mermaid-cli@${MERMAID_CLI_VERSION}`,
      `mermaid@${MERMAID_VERSION}`
    ], { stdio: 'inherit' });
  });

  it('reports an unsuccessful installation', () => {
    const runCommand = vi.fn(() => ({ status: 1 }));

    expect(() => prepareMermaidCli({
      executable: '/missing/mermaid-cli.js',
      environment: {},
      runCommand,
      fileExists: () => false
    })).toThrow('No se pudo instalar Mermaid CLI automáticamente');
  });

  it('replaces an installed renderer that cannot export the required UML syntax', () => {
    const isCompatible = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
    const runCommand = vi.fn(() => ({ status: 0 }));

    prepareMermaidCli({
      executable: '/workspace/node_modules/@mermaid-js/mermaid-cli/src/cli.js',
      environment: {},
      runCommand,
      fileExists: () => true,
      isCompatible
    });

    expect(runCommand).toHaveBeenCalledOnce();
    expect(isCompatible).toHaveBeenCalledTimes(2);
  });

  it('does not accept a successful installation of incompatible versions', () => {
    expect(() => prepareMermaidCli({
      executable: '/workspace/node_modules/@mermaid-js/mermaid-cli/src/cli.js',
      environment: {},
      runCommand: () => ({ status: 0 }),
      fileExists: () => true,
      isCompatible: () => false
    })).toThrow('No se pudo instalar Mermaid CLI automáticamente');
  });
});
