import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach, beforeEach, vi } from 'vitest';

enableAutoUnmount(afterEach);

declare const jsdom: { window: Window };

// Node 26 expone Storage global; las pruebas DOM necesitan el Storage real de jsdom.
beforeEach(() => {
  vi.stubGlobal('localStorage', jsdom.window.localStorage);
  vi.stubGlobal('sessionStorage', jsdom.window.sessionStorage);
});
afterEach(() => vi.unstubAllGlobals());
