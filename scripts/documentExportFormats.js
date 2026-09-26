const DEFAULT_PUBLICATION = 'todos';
const DEFAULT_FORMAT = 'ambos';

export const getDocumentExportRequest = (argumentsList = []) => {
    const positionalArguments = argumentsList.filter((argument) => argument !== '--check');

    return {
        publication: positionalArguments[0] ?? DEFAULT_PUBLICATION,
        format: positionalArguments[1] ?? DEFAULT_FORMAT,
        checkOnly: argumentsList.includes('--check')
    };
};

export const getDocumentOutputPlan = (format = DEFAULT_FORMAT) => ({
    generateDocx: true,
    generatePdf: format === 'pdf' || format === 'ambos'
});
