import { describe, expect, it, vi } from 'vitest';

const get = vi.fn();
const authorizeUserWeb = vi.fn(permission => `authorize:${permission}`);
const verifyCookiesAuthTokenRequired = vi.fn();
const getWasteIssuesPage = vi.fn();

vi.mock('express', () => ({
  default: {
    Router: () => ({ get })
  }
}));

vi.mock('../../../../../src/middleware/authMiddleware.js', () => ({
  authorizeUserWeb,
  verifyCookiesAuthTokenRequired
}));

vi.mock('../../../../../src/controllers/web/warehouse/wasteIssueController.js', () => ({
  getWasteIssuesPage
}));

const { PERMISSIONS } = await import('../../../../../src/constants/permissions.js');
const { default: wasteIssueWebRoutes } = await import('../../../../../src/routes/web/warehouse/wasteIssueWebRoute.js');

describe('wasteIssueWebRoute', () => {
  it('registers the waste issue page with authentication and its domain permission', () => {
    expect(wasteIssueWebRoutes).toEqual({ get });
    expect(authorizeUserWeb).toHaveBeenCalledWith(PERMISSIONS.WASTE_ISSUES_PAGE_VIEW);
    expect(get).toHaveBeenCalledWith(
      '/',
      verifyCookiesAuthTokenRequired,
      `authorize:${PERMISSIONS.WASTE_ISSUES_PAGE_VIEW}`,
      getWasteIssuesPage
    );
  });
});
