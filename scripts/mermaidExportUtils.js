import { createHash } from 'node:crypto';

export const MERMAID_CLI_VERSION = '12.0.0';
export const MERMAID_VERSION = '12.1.0';
export const MERMAID_EXPORT_CONFIG = Object.freeze({
    theme: 'neutral',
    look: 'classic',
    fontFamily: 'Arial, sans-serif'
});

export const getMermaidImageId = (source) => createHash('sha256')
    .update(JSON.stringify({
        source,
        cliVersion: MERMAID_CLI_VERSION,
        mermaidVersion: MERMAID_VERSION,
        config: MERMAID_EXPORT_CONFIG,
        backgroundColor: 'white',
        scale: 2
    }))
    .digest('hex').slice(0, 16);

export const normalizeMermaidSource = (source) => {
    const content = source.replace(/\r?\n$/, '');
    const normalizedLines = !content.includes('\n') && content.includes('\\n')
        ? `${content.replace(/\\r\\n|\\n/g, '\n')}\n`
        : source;

    return normalizedLines;
};

export const hasInvalidSvgGeometry = (output) => (
    /(?:attribute|points:).*?(?:NaN|-?Infinity)/i.test(output)
);
