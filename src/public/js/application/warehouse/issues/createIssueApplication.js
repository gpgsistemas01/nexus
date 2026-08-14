import {
    createApplicationMutation,
    createCrudApplication
} from '../../createCrudApplication.js';

export const createIssueApplication = ({ requests, dataKeys = {} }) => Object.freeze({
    ...createCrudApplication({
        requests,
        dataKey: dataKeys.issue
    }),
    editHeader: createApplicationMutation({
        request: requests.editHeader,
        dataKey: dataKeys.issue
    }),
    editDetails: createApplicationMutation({
        request: requests.editDetails,
        dataKey: dataKeys.issue
    }),
    returnDetail: createApplicationMutation({
        request: requests.returnDetail,
        dataKey: dataKeys.issueReturn
    })
});
