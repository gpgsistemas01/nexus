import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { getExpressRouteDeclarations } from '../../../scripts/expressRouteUtils.js';

describe('inventario de rutas Express', () => {
  it('conserva todas las alternativas que Express registra para un mismo handler', () => {
    const source = readFileSync('src/routes/api/admin/reportApiRoute.js', 'utf8');
    const routes = getExpressRouteDeclarations(source);

    expect(routes).toContainEqual({ method: 'GET', route: '/persons/excel' });
    expect(routes).toContainEqual({ method: 'GET', route: '/profiles/excel' });
    expect(routes).toHaveLength(5);
  });

  it('combina métodos y comillas sin colapsar caminos distintos', () => {
    expect(getExpressRouteDeclarations("router.post('/nuevo', handler); router.get([\"/uno\", `/dos`,], handler);"))
      .toEqual([
        { method: 'POST', route: '/nuevo' },
        { method: 'GET', route: '/uno' },
        { method: 'GET', route: '/dos' }
      ]);
  });

  it('rechaza una ruta dinámica para impedir que la cobertura pase omitiéndola', () => {
    expect(() => getExpressRouteDeclarations('router.get(routeName, handler);')).toThrow('rutas literales');
    expect(() => getExpressRouteDeclarations('router.get(`/item/${type}`, handler);')).toThrow('rutas literales');
  });
});
