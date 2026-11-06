const DEFAULT_PUBLICATION = 'todos';
const DEFAULT_FORMAT = 'ambos';
const EXPORT_FORMATS = new Set(['docx', 'pdf', 'ambos']);

export const getDocumentExportRequest = (argumentsList = []) => {
    const checkSourcesOnly = argumentsList.includes('--check-sources');
    const positionalArguments = argumentsList.filter((argument) => (
        argument !== '--check' && argument !== '--check-sources'
    ));
    const [publication = DEFAULT_PUBLICATION, documentOrFormat, explicitFormat] = positionalArguments;
    const hasDocument = Boolean(documentOrFormat && !EXPORT_FORMATS.has(documentOrFormat));

    return {
        publication,
        document: hasDocument ? documentOrFormat : null,
        format: (hasDocument ? explicitFormat : documentOrFormat) ?? DEFAULT_FORMAT,
        checkOnly: argumentsList.includes('--check') || checkSourcesOnly,
        checkSourcesOnly
    };
};

export const getDocumentOutputPlan = (format = DEFAULT_FORMAT) => ({
    generateDocx: true,
    generatePdf: format === 'pdf' || format === 'ambos'
});
