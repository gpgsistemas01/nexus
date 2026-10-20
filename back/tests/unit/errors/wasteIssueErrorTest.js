import { describe, expect, it } from 'vitest';
import {
  WasteIssueStateConflict,
  WasteIssueDuplicateWasteConflict,
  WasteIssueWasteUnavailableConflict,
  WasteIssueFulfillmentStatusNotFound
} from '../../../src/errors/warehouse/wasteIssueError.js';
import { errorMap } from '../../../src/messages/codeMessages.js';
import { getErrorMessage } from '../../../src/public/js/constants/apiMessages.js';

describe('códigos de conflicto de salidas de merma', () => {
  it.each([
    [WasteIssueStateConflict, errorMap.wasteIssue.STATE_CONFLICT, 409],
    [WasteIssueDuplicateWasteConflict, errorMap.wasteIssue.DUPLICATE_WASTE, 409],
    [WasteIssueWasteUnavailableConflict, errorMap.wasteIssue.WASTE_UNAVAILABLE, 409],
    [WasteIssueFulfillmentStatusNotFound, errorMap.wasteIssue.FULFILLMENT_STATUS_NOT_FOUND, 500]
  ])('%s entrega un código traducible en la interfaz', (ErrorType, code, statusCode) => {
    const error = new ErrorType();
    expect(error).toMatchObject({ code, statusCode });
    expect(getErrorMessage({ code })).not.toBe(code);
    expect(getErrorMessage({ code })).toEqual(expect.any(String));
  });
});
