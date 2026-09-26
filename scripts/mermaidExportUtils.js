const customSequenceParticipant = /^(\s*(?:actor|participant)\s+[A-Za-z_][\w-]*)@\{[^\r\n}]*\}(\s+as\s+)/gm;

export const normalizeMermaidSource = (source) => {
    const content = source.replace(/\r?\n$/, '');
    const normalizedLines = !content.includes('\n') && content.includes('\\n')
        ? `${content.replace(/\\r\\n|\\n/g, '\n')}\n`
        : source;

    // Mermaid's experimental sequence participant shapes can render non-finite SVG
    // coordinates in headless Chromium. Published diagrams use the stable shape.
    return normalizedLines.replace(customSequenceParticipant, '$1$2');
};

export const hasInvalidSvgGeometry = (output) => (
    /(?:attribute|points:).*?(?:NaN|-?Infinity)/i.test(output)
);
