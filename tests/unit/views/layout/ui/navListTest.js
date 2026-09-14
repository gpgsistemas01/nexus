import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ejs from 'ejs';
import { describe, expect, it } from 'vitest';

import { hasPermission } from '../../../../../src/public/js/constants/permissions.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const navListPath = path.resolve(
  currentDirectory,
  '../../../../../src/views/layout/ui/navList.ejs'
);

const renderNavList = permissions => ejs.renderFile(navListPath, {
  accordionId: 'testNavigation',
  currentRoute: '/',
  hasPermission,
  listClass: 'navbar-nav',
  showIcons: true,
  showLabels: true,
  user: { permissions }
});

describe('navList', () => {
  it('shows the consumables module in the main navigation for authorized users', async () => {
    const html = await renderNavList(['materials:read']);

    expect(html).toContain('href="/almacen/consumibles"');
    expect(html).toContain('Consumibles');
  });

  it('hides the consumables module without material read permission', async () => {
    const html = await renderNavList([]);

    expect(html).not.toContain('href="/almacen/consumibles"');
    expect(html).not.toContain('Consumibles');
  });
});
