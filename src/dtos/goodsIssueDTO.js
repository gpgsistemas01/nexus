import { createIssueDetailsDto, createIssueHeaderDto } from './issueDTO.js';

const buildGoodsIssueDto = (body = {}) => ({
    ...createIssueHeaderDto(body),
    details: createIssueDetailsDto(body.details, {
        itemIdField: 'materialId',
        mapAdditionalFields: detail => ({
            supplierId: detail.supplierId.trim(),
            ...(detail.presentationId && {
                presentationId: detail.presentationId.trim()
            })
        })
    })
});

export const createGoodsIssueDtoForRegister = (body = {}) => buildGoodsIssueDto(body);

export const createGoodsIssueDtoForEdit = (body = {}) => buildGoodsIssueDto(body);

export const createGoodsIssueDetailsDtoForEdit = (body = {}) => ({
    details: (body.details).map(d => ({
        id: d.id,
        isSupplied: Boolean(d.isSupplied),
        projectConvertedQuantity: Number(d.projectConvertedQuantity)
    }))
});


export const createGoodsIssueHeaderDtoForEdit = (body = {}) => createIssueHeaderDto(body);


export const createGoodsIssueDtoForReturn = (body = {}) => ({
    returnQuantity: Number(body.returnQuantity),
    ...(Object.prototype.hasOwnProperty.call(body, 'observations') ? { observations: body.observations.trim() } : {})
});
