import { createIssueDetailsDto, createIssueHeaderDto, createIssueSupplyDetailsDto } from './issueDTO.js';

export const createWasteIssueDtoForRegister = (body = {}) => ({
    ...createIssueHeaderDto(body),
    details: createIssueDetailsDto(body.details, { itemIdField: 'wasteId' })
});

export const createWasteIssueDtoForEdit = (body = {}) => createWasteIssueDtoForRegister(body);

export const createWasteIssueHeaderDtoForEdit = (body = {}) => createIssueHeaderDto(body);

export const createWasteIssueDetailsDtoForEdit = (body = {}) => ({
    details: createIssueSupplyDetailsDto(body.details)
});

export const createWasteIssueDtoForReturn = (body = {}) => ({
    returnQuantity: body.returnQuantity,
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') && {
        observations: body.observations.trim()
    })
});
