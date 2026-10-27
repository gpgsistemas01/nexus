import { readFile, writeFile, access, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import {
  DEMO_PROFILES,
  demoSession,
  readAccounts,
  readCredentials,
  verifyConfiguredAccess,
} from '../../scripts/manual/profiles.mjs';
import { prepareManual, accessFingerprint } from '../../scripts/manual/publication.mjs';
import { captureRecipe, captureFamily, type CaptureFamily } from './captureRecipes.js';
import { mockWarehouse } from '../e2e/warehouseFixtures.js';
import { mockRecords } from '../e2e/recordsFixtures.js';
import { mockCatalogs } from '../e2e/catalogFixtures.js';
import { mockPurchases } from '../e2e/purchaseFixtures.js';
import { mockIssues } from '../e2e/issueFixtures.js';
import { mockMovements } from '../e2e/movementFixtures.js';
import { PERMISSIONS as P } from '@nexus/permissions';
import type { SessionUser } from '../../src/modules/auth/session.js';

const mode = process.env.FRONT_MANUAL_MODE ?? 'demo';
const frontRoot = process.cwd();
const accounts =
  mode === 'demo'
    ? DEMO_PROFILES
    : (await readAccounts(process.env.FRONT_MANUAL_ACCOUNTS!)).accounts;
const selected = (process.env.FRONT_MANUAL_IDS ?? '').split(',');

const fileHash = async (filename: string) =>
  createHash('sha256')
    .update(await readFile(filename))
    .digest('hex');

const treeHash = async (folder: string): Promise<string> => {
  const result = [];
  for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const filename = path.join(folder, entry.name);
    result.push(
      entry.name + (entry.isDirectory() ? await treeHash(filename) : await fileHash(filename)),
    );
  }
  return createHash('sha256').update(result.join('\n')).digest('hex');
};

const realSession = async (
  context: BrowserContext,
): Promise<SessionUser & { accesses?: { roleKey: string; departmentKey: string }[] }> => {
  try {
    const response = await context.request.get('/api/auth/me');
    if (!response.ok()) throw new Error('Session unavailable');
    const body = await response.json();
    if (
      !body.user ||
      typeof body.user.id !== 'string' ||
      typeof body.user.name !== 'string' ||
      !Array.isArray(body.user.permissions) ||
      !body.user.permissions.every((p: unknown) => typeof p === 'string')
    )
      throw new Error('Invalid session contract');
    return body.user;
  } catch {
    throw new Error(
      'No se pudo comprobar la sesión y sus permisos. Revise el servicio y el acceso de la cuenta.',
    );
  }
};

const installDemo = async (page: Page, family: CaptureFamily, user: SessionUser, state: string) => {
  const permissions = [...user.permissions];
  if (family === 'warehouse') await mockWarehouse(page, permissions);
  else if (family === 'records') await mockRecords(page, permissions);
  else if (family === 'catalogs') await mockCatalogs(page, permissions);
  else if (family === 'purchases') await mockPurchases(page, permissions);
  else if (family === 'issues')
    await mockIssues(
      page,
      permissions,
      state,
      (user as SessionUser & { accesses?: { department?: string }[] }).accesses?.[0]?.department,
    );
  else await mockMovements(page, permissions);
  await page.route('**/api/auth/me', (route) => route.fulfill({ json: { user } }));
};

for (const account of accounts.filter(({ id }: { id: string }) => selected.includes(id)))
  test(`manual ${account.id}`, async ({ context }) => {
    const profile = { ...account, mode };
    const writes: string[] = [];
    await context.route('**/api/**', (route) =>
      mode === 'demo' ? route.abort('blockedbyclient') : route.continue(),
    );
    context.on('request', (request) => {
      const url = new URL(request.url());
      if (!url.pathname.startsWith('/api/') || request.method() === 'GET') return;
      if (mode === 'live' && request.method() === 'POST' && url.pathname === '/api/auth/refresh')
        return;
      writes.push(`${request.method()} ${url.pathname}`);
    });
    const protect = async (page: Page) => {
      await page.route('**/api/**', (route) => {
        const request = route.request();
        const pathname = new URL(request.url()).pathname;
        return request.method() === 'GET' ||
          (mode === 'live' && request.method() === 'POST' && pathname === '/api/auth/refresh')
          ? route.fallback()
          : route.abort('blockedbyclient');
      });
    };
    // Authentication uses the API context, never a password field, trace or disk session.
    if (mode === 'live') {
      try {
        const credentials = await readCredentials(account, process.env.FRONT_MANUAL_ENV_FILE);
        const response = await context.request.post('/api/auth/login', { data: credentials });
        if (!response.ok()) throw new Error('Authentication rejected');
      } catch {
        throw new Error(
          `No se pudo autenticar ${account.id}. Revise sus variables locales y el servicio; no comparta los valores.`,
        );
      }
    }
    const user = mode === 'demo' ? demoSession(account) : await realSession(context);
    if (mode === 'live') verifyConfiguredAccess(account, user);
    const root = path.join(frontRoot, 'build/manuals', account.id);
    let previous;
    try {
      previous = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const manifest = await prepareManual(frontRoot, profile, user);
    const revision = createHash('sha256')
      .update(
        JSON.stringify([
          await treeHash(path.join(frontRoot, 'src')),
          await treeHash(path.join(frontRoot, 'scripts/manual')),
          await treeHash(path.join(frontRoot, 'tests/manual-profiles')),
          await treeHash(path.join(frontRoot, 'docs/user-manual')),
          user.id,
          user.accesses ?? [],
          manifest.accessFingerprint,
          await fileHash(path.resolve(frontRoot, '../back/src/constants/permissions.js')),
          process.env.FRONT_MANUAL_BASE_URL,
          profile.label,
          mode,
        ]),
      )
      .digest('hex');
    const captures: Record<string, { status: string; sha256?: string; reason?: string }> = {};
    const save = async (status: string) =>
      writeFile(
        path.join(root, 'manifest.json'),
        JSON.stringify({ ...manifest, revision, status, captures }, null, 2) + '\n',
      );
    await save('pending');
    for (const filename of manifest.images) {
      const destination = path.join(root, 'images', filename);
      if (
        process.env.FRONT_MANUAL_MISSING === 'true' &&
        previous?.revision === revision &&
        previous.captures?.[filename]?.status === 'complete'
      ) {
        try {
          await access(destination);
          if ((await fileHash(destination)) === previous.captures[filename].sha256) {
            captures[filename] = previous.captures[filename];
            continue;
          }
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        }
      }
      const page = await context.newPage();
      try {
        if (mode === 'demo') {
          if (filename === '01-login.png')
            await page.route('**/api/auth/me', (route) =>
              route.fulfill({ status: 401, json: { code: 'INVALID_AUTH' } }),
            );
          else
            await installDemo(
              page,
              captureFamily(filename, user.permissions),
              user,
              filename.startsWith('25-') ? 'Surtido' : 'Pendiente',
            );
        }
        await protect(page);
        if (mode === 'live' && filename === '01-login.png') {
          // The public login illustration uses an isolated, unauthenticated context.
          const anonymous = await context.browser()!.newContext({
            baseURL: (await readAccounts(process.env.FRONT_MANUAL_ACCOUNTS!)).baseUrl,
            viewport: { width: 1600, height: 1400 },
          });
          try {
            await captureRecipe(await anonymous.newPage(), filename, root, user);
          } finally {
            await anonymous.close();
          }
        } else await captureRecipe(page, filename, root, user);
        expect(writes).toEqual([]);
        captures[filename] = { status: 'complete', sha256: await fileHash(destination) };
      } catch (cause) {
        captures[filename] = {
          status: 'pending',
          reason:
            cause instanceof Error
              ? cause.message.slice(0, 1400)
              : 'Revisar servicio, permisos, registro existente o selector de esta captura.',
        };
      } finally {
        await page.close();
      }
      await save('pending');
    }
    // A supplied record demonstrates that hidden return controls are permission based.
    if (mode === 'demo' && !user.permissions.includes(P.GOODS_ISSUE_DETAILS_MANAGE)) {
      const page = await context.newPage();
      await installDemo(page, 'issues', user, 'Surtido');
      await protect(page);
      await page.goto('/salidas/materiales');
      await expect(page.getByRole('cell', { name: 'SAL-001', exact: true })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Devolver material surtido', exact: true }),
      ).toHaveCount(0);
      await page.close();
    }
    const pending = manifest.images.filter((filename) => captures[filename]?.status !== 'complete');
    expect(writes).toEqual([]);
    if (mode === 'live')
      expect(accessFingerprint(await realSession(context))).toBe(manifest.accessFingerprint);
    if (pending.length)
      throw new Error(
        `Capturas pendientes para ${account.id}: ${pending.join(', ')}. Revise build/manuals/${account.id}/manifest.json y reanude con --missing.`,
      );
    await save('ready');
  });
