import { createMemoryHistory, createRouter } from 'vue-router';
import { expect, it } from 'vitest';
import { protectedDestination } from '../../../src/app/router/protectedDestination.js';

const component = { template: '<div />' };
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/almacen', meta: { requiresAuth: true }, component },
    { path: '/directorio/clientes', meta: { requiresAuth: true }, component },
    { path: '/inicio-sesion', component },
    { path: '/sesion-no-disponible', component },
    { path: '/:pathMatch(.*)*', component },
  ],
});

it('la recuperación conserva ruta, consulta y fragmento de un módulo protegido', () => {
  const target = '/directorio/clientes?consulta=Ana#tabla';
  expect(protectedDestination(router, target)).toBe(target);
});

it.each([
  undefined,
  ['//otro.test'],
  'https://otro.test',
  '//otro.test',
  '/inicio-sesion',
  '/sesion-no-disponible',
  '/desconocida',
])('el retorno %j usa la entrada autorizada y evita salidas externas o ciclos', (value) => {
  expect(protectedDestination(router, value)).toBe('/almacen');
});
