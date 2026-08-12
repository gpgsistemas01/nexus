import { findPersonById } from '../../admin/person/personService.js';
import { isValidInternalClientAdvisor } from '../../admin/person/personRules.js';
import { findDepartmentById } from '../../admin/departmentService.js';
import { findClientById } from '../../sales/clientService.js';
import { INTERNAL_CLIENT_NAME, PROJECT_NUMBER_BY_DEPARTMENT } from '../../../constants/issueHeaderRules.js';
import { normalizeText } from '../../../utils/formattersUtils.js';

const isInternalClient = client => (
    normalizeText(client?.name || '') === normalizeText(INTERNAL_CLIENT_NAME)
);

const isValidProjectNumber = ({ client, department, projectNumber = '' }) => {

    if (!isInternalClient(client)) return true;

    const expectedProjectNumber = PROJECT_NUMBER_BY_DEPARTMENT.get(department?.name || '');

    return Boolean(expectedProjectNumber) && expectedProjectNumber === projectNumber;
};

export const resolveIssueHeaderData = async ({
    requesterId,
    advisorId,
    departmentId,
    clientId,
    issueData,
    errorTypes,
    statusName = null
}) => {

    const requester = await findPersonById({ id: requesterId });

    if (!requester) throw new errorTypes.RequesterNotFound();

    const advisor = await findPersonById({ id: advisorId, includeAccesses: true });

    if (!advisor) throw new errorTypes.AdvisorNotFound();

    const client = await findClientById({ id: clientId });
    const department = await findDepartmentById({ id: departmentId });

    if (!isValidInternalClientAdvisor({ client, advisor })) throw new errorTypes.ClientAdvisorConflict();

    if (!isValidProjectNumber({ client, department, projectNumber: issueData.projectNumber })) {
        throw new errorTypes.ProjectNumberConflict({
            projectNumber: issueData.projectNumber,
            departmentName: department?.name
        });
    }

    return {
        ...issueData,
        departmentName: department.name,
        requesterName: requester.fullName,
        advisorName: advisor.fullName,
        clientName: client.name,
        department: {
            connect: { id: departmentId }
        },
        requester: {
            connect: { id: requesterId }
        },
        advisor: {
            connect: { id: advisorId }
        },
        client: {
            connect: { id: clientId }
        },
        ...(statusName && { status: { connect: { name: statusName } } })
    };
};
