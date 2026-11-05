import { describe, expect, it } from 'vitest';
import ejs from 'ejs';
import { hasPermission } from '../../../src/shared/constants/permissions.js';

const renderNav = ({ permissions = [], currentRoute = '/personas', showLabels = true } = {}) =>
  ejs.renderFile('src/views/layout/ui/navList.ejs', {
    user: { permissions }, currentRoute, showLabels, listClass: '', hasPermission
  });

const findGroup = (html, label) => {
  const button = [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].find(([, attributes, content]) => (
    attributes.includes(`aria-label="${label}"`)
    || content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() === label
  ));
  if (!button) return null;

  const id = button[1].match(/aria-controls="([^"]+)"/)[1];
  const submenu = html.match(new RegExp(`<ul id="${id}"[^>]*>([\\s\\S]*?)<\\/ul>`))[1];
  return { attributes: button[1], submenu };
};

const destinations = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(([, href]) => href).sort();

describe('navegación EJS: identidad, directorio y catálogos por permiso', () => {
  it.each([
    [['persons:page-view'], ['/personas'], 'Identidad y acceso'],
    [['users:manage'], ['/usuarios-sistemas'], 'Identidad y acceso'],
    [['clients:page-view'], ['/clientes'], 'Directorio comercial'],
    [['suppliers:page-view'], ['/proveedores'], 'Directorio comercial'],
    [['clients:page-view', 'suppliers:page-view'], ['/clientes', '/proveedores'], 'Directorio comercial']
  ])('muestra sólo los destinos permitidos con %j', async (permissions, expected, label) => {
    const html = await renderNav({ permissions });
    expect(destinations(html)).toEqual(expected.sort());
    expect(destinations(findGroup(html, label).submenu)).toEqual(expected.sort());
    expect(findGroup(html, label === 'Directorio comercial' ? 'Identidad y acceso' : 'Directorio comercial')).toBeNull();
    expect(findGroup(html, 'Catálogos')).toBeNull();
  });

  it.each([true, false])('conserva los dos módulos de identidad y la opción activa con etiquetas=%s', async showLabels => {
    const html = await renderNav({
      permissions: ['persons:page-view', 'users:manage'],
      currentRoute: '/usuarios-sistemas', showLabels
    });
    const group = findGroup(html, 'Identidad y acceso');
    expect(destinations(group.submenu)).toEqual(['/personas', '/usuarios-sistemas']);
    expect(group.submenu).toMatch(/href="\/usuarios-sistemas"\s+aria-current="page"/);
    expect(group.attributes).toContain(`aria-expanded="${showLabels ? 'true' : 'false'}"`);
  });

  it.each([true, false])('un acceso comercial abre su directorio sin exponer auxiliares, con etiquetas=%s', async showLabels => {
    const html = await renderNav({
      permissions: ['clients:page-view'], currentRoute: '/clientes', showLabels
    });
    const group = findGroup(html, 'Directorio comercial');
    expect(destinations(group.submenu)).toEqual(['/clientes']);
    expect(group.submenu).toMatch(/href="\/clientes"\s+aria-current="page"/);
    expect(group.attributes).toContain(`aria-expanded="${showLabels ? 'true' : 'false'}"`);
  });

  it('administrar auxiliares no concede acceso a clientes, proveedores ni identidad', async () => {
    const html = await renderNav({ permissions: ['catalogs:manage'] });
    const links = destinations(findGroup(html, 'Catálogos').submenu);
    expect(links).toEqual([
      'departments', 'fulfillment-statuses', 'presentations', 'reasons', 'roles', 'unit-measures'
    ].map(name => `/catalogos/${name}`));
    expect(findGroup(html, 'Identidad y acceso')).toBeNull();
    expect(findGroup(html, 'Directorio comercial')).toBeNull();
    expect(destinations(html)).toEqual(links);
  });

  it('sin permisos oculta los grupos vacíos aunque se solicite una de sus rutas', async () => {
    const html = await renderNav({ currentRoute: '/usuarios-sistemas' });
    expect(findGroup(html, 'Identidad y acceso')).toBeNull();
    expect(findGroup(html, 'Catálogos')).toBeNull();
    expect(findGroup(html, 'Directorio comercial')).toBeNull();
    expect(destinations(html)).toEqual([]);
  });
});
