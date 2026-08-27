import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const post = vi.fn();
const patch = vi.fn();
const authorizeUserApi = vi.fn(permission => `authorize:${permission}`);
const verifyApiTokenRequired = vi.fn();
const validate = vi.fn();
const wasteIssueValidation = [vi.fn()];
const wasteIssueUpdateValidation = [vi.fn()];
const wasteIssueHeaderValidation = [vi.fn()];
const wasteIssueDetailsValidation = [vi.fn()];
const issueReturnValidation = [vi.fn()];
const getAllWasteIssues = vi.fn();
const registerWasteIssue = vi.fn();
const editWasteIssue = vi.fn();
const editWasteIssueHeader = vi.fn();
const editWasteIssueDetails = vi.fn();
const returnWasteIssueDetail = vi.fn();

vi.mock('express', () => ({
  default: {
    Router: () => ({ get, post, patch })
  }
}));

vi.mock('../../../../../src/middleware/authMiddleware.js', () => ({
  authorizeUserApi,
  verifyApiTokenRequired
}));

vi.mock('../../../../../src/middleware/validatorMiddleware.js', () => ({ validate }));

vi.mock('../../../../../src/validators/forms/wasteIssueValidations.js', () => ({
  wasteIssueDetailsValidation,
  wasteIssueHeaderValidation,
  wasteIssueUpdateValidation,
  wasteIssueValidation
}));

vi.mock('../../../../../src/validators/forms/issueReturnValidations.js', () => ({
  issueReturnValidation
}));

vi.mock('../../../../../src/controllers/api/warehouse/wasteIssueController.js', () => ({
  editWasteIssue,
  editWasteIssueDetails,
  editWasteIssueHeader,
  getAllWasteIssues,
  registerWasteIssue,
  returnWasteIssueDetail
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: wasteIssueApiRoutes } = await import('../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js');

describe('wasteIssueApiRoute', () => {
  it('registers the complete waste issue CRUD and return routes', () => {
    expect(wasteIssueApiRoutes).toEqual({ get, post, patch });
    expect(get).toHaveBeenCalledWith(
      '/',
      verifyApiTokenRequired,
      `authorize:${PERMISSIONS.WASTE_ISSUES_MANAGE}`,
      getAllWasteIssues
    );
    expect(post).toHaveBeenCalledWith(
      '/',
      verifyApiTokenRequired,
      wasteIssueValidation,
      validate,
      `authorize:${PERMISSIONS.WASTE_ISSUES_MANAGE}`,
      registerWasteIssue
    );
    expect(patch).toHaveBeenCalledWith(
      '/:id',
      verifyApiTokenRequired,
      wasteIssueUpdateValidation,
      validate,
      `authorize:${PERMISSIONS.WASTE_ISSUES_MANAGE}`,
      editWasteIssue
    );
    expect(patch).toHaveBeenCalledWith(
      '/:id/header',
      verifyApiTokenRequired,
      wasteIssueHeaderValidation,
      validate,
      `authorize:${PERMISSIONS.WASTE_ISSUES_MANAGE}`,
      editWasteIssueHeader
    );
    expect(patch).toHaveBeenCalledWith(
      '/:id/details',
      verifyApiTokenRequired,
      wasteIssueDetailsValidation,
      validate,
      `authorize:${PERMISSIONS.WASTE_ISSUES_SUPPLY}`,
      editWasteIssueDetails
    );
    expect(patch).toHaveBeenCalledWith(
      '/:id/details/:detailId/returns',
      verifyApiTokenRequired,
      issueReturnValidation,
      validate,
      `authorize:${PERMISSIONS.WASTE_ISSUES_SUPPLY}`,
      returnWasteIssueDetail
    );
  });
});
