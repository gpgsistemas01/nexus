/** @typedef {{family: 'purchases'|'issues', resource: 'materiales'|'consumibles'|'mermas', state: 'canceled'|'partial'|'returned'|'correct'|'supply'|'return'}} DocumentCapture */

/** @type {Record<string, DocumentCapture>} */
export const DOCUMENT_STATE_CAPTURES = {};
for (const [index, resource] of /** @type {const} */ (['materiales', 'consumibles']).entries()) {
    DOCUMENT_STATE_CAPTURES[`20${index ? 'd' : 'c'}-purchase-canceled.png`] = {
        family: 'purchases',
        resource,
        state: 'canceled',
    };
}
for (const [index, resource] of /** @type {const} */ ([
    'materiales',
    'consumibles',
    'mermas',
]).entries()) {
    const letter = String.fromCharCode(97 + index);
    DOCUMENT_STATE_CAPTURES[`24${letter}-issue-partial.png`] = {
        family: 'issues',
        resource,
        state: 'partial',
    };
    DOCUMENT_STATE_CAPTURES[`25${letter}-issue-partial-return.png`] = {
        family: 'issues',
        resource,
        state: 'returned',
    };
    DOCUMENT_STATE_CAPTURES[`25${String.fromCharCode(100 + index)}-issue-canceled.png`] = {
        family: 'issues',
        resource,
        state: 'canceled',
    };
}

export class ManualExampleUnavailable extends Error {
    constructor(message) {
        super(message);
        this.name = 'ManualExampleUnavailable';
    }
}

export const isUnavailableExample = (filename, capture, mode) =>
    mode === 'dev' &&
    Object.hasOwn(DOCUMENT_STATE_CAPTURES, filename) &&
    capture?.status === 'unavailable' &&
    typeof capture.reason === 'string' &&
    capture.reason.trim().length > 0;
