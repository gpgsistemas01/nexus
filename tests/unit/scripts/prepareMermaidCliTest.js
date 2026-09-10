import { describe, expect, it, vi } from 'vitest';
import { prepareMermaidCli } from '../../../scripts/prepareMermaidCli.js';

describe('prepareMermaidCli', () => {
  it('reuses the installed executable without invoking npm', () => {
    const runCommand = vi.fn();

    const executable = prepareMermaidCli({
      executable: '/workspace/node_modules/@mermaid-js/mermaid-cli/src/cli.js',
      runCommand,
      fileExists: () => true
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
      fileExists
    });

    expect(runCommand).toHaveBeenCalledWith('npm', [
      'install',
      '--no-save',
      '--package-lock=false',
      '@mermaid-js/mermaid-cli'
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
});
