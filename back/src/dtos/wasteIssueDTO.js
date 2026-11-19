import { createIssueDetailsDto, createIssueHeaderDto, createIssueSupplyDetailsDto } from './issueDTO.js';

const buildWasteIssueDto = (body = {}) => ({
    ...createIssueHeaderDto(body),
    details: createIssueDetailsDto(body.details, { itemIdField: 'wasteId' })
});

export const createWasteIssueDtoForRegister = (body = {}) => ({ ...buildWasteIssueDto(body), ...(body.supplyImmediately === true && { supplyImmediately: true }) });

export const createWasteIssueDtoForEdit = (body = {}) => buildWasteIssueDto(body);

export const createWasteIssueHeaderDtoForEdit = (body = {}) => createIssueHeaderDto(body);

export const createWasteIssueDetailsDtoForEdit = (body = {}) => ({
    details: createIssueSupplyDetailsDto(body.details)
});

export const createWasteIssueDtoForReturn = (body = {}) => ({
    ...(body.physicalReturnConfirmed === true && { physicalReturnConfirmed: true }),
    returnQuantity: body.returnQuantity,
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') && {
        observations: body.observations.trim()
    })
});
