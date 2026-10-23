import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import ejs from 'ejs';
import { hasPermission } from '../../../src/shared/constants/permissions.js';
import { serializeScriptData } from '../../../src/utils/scriptDataUtils.js';

const hostileText = '</script><script>window.injected=true</script><script> & " \' \\ \u2028\u2029';

describe('datos JSON insertados en scripts EJS (DP-SEC-001)', () => {
  it.each([
    ['pages/home/login/loginPage.ejs', 'FLASH_MESSAGE', { message: hostileText, type: 'error' }, 2],
    ['layout/site.ejs', 'meta', { name: hostileText, permissions: [] }, 1]
  ])('conserva el dato de %s sin crear etiquetas ejecutables', async (view, property, data, scriptCount) => {
    const html = await ejs.renderFile(`src/views/${view}`, {
      appName: 'Nexus', flash: data, user: data, body: '', currentRoute: '/',
      hasPermission, serializeScriptData, contentFor: () => ''
    });
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
    expect(scripts).toHaveLength(scriptCount);
    const embedded = scripts.find(([, content]) => content.includes(`window.${property} =`));
    expect(embedded).toBeDefined();
    expect(embedded[1]).not.toContain('<');
    const window = {};
    runInNewContext(embedded[1], { window });
    expect(window[property]).toEqual(data);
    expect(window.injected).toBeUndefined();
  });

  it.each([null, undefined])('serializa datos ausentes %j como null', value => {
    expect(serializeScriptData(value)).toBe('null');
  });
});
