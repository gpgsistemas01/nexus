import { createCrudApplication } from '../../createCrudApplication.js';

export const createIssueApplication = ({ requests, dataKeys = {} }) => createCrudApplication({
    requests,
    dataKey: dataKeys.issue,
    dataKeys: { returnDetail: dataKeys.issueReturn },
    additionalMutations: ['editHeader', 'editDetails', 'returnDetail']
});
