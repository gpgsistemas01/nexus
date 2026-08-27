import { createIssueDetailsDto, createIssueHeaderDto } from './issueDTO.js';

export const createWasteIssueDtoForRegister = (body = {}) => ({
    ...createIssueHeaderDto(body),
    details: createIssueDetailsDto(body.details, { itemIdField: 'wasteId' })
});

export const createWasteIssueDtoForEdit = (body = {}) => createWasteIssueDtoForRegister(body);

export const createWasteIssueHeaderDtoForEdit = (body = {}) => createIssueHeaderDto(body);

export const createWasteIssueDetailsDtoForEdit = (body = {}) => ({
    details: body.details.map(detail => ({
        id: detail.id,
        isSupplied: Boolean(detail.isSupplied),
        projectConvertedQuantity: Number(detail.projectConvertedQuantity)
    }))
});

export const createWasteIssueDtoForReturn = (body = {}) => ({
    returnQuantity: Number(body.returnQuantity),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') && {
        observations: body.observations.trim()
    })
});
