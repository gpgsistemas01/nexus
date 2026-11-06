import 'dotenv/config.js';
import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { logger } from './utils/logger.js';
import { initSocket } from './utils/socketUtils.js';
import { registerServerLifecycle } from './utils/serverLifecycle.js';
import { startInventoryImportCleanup } from './services/warehouse/imports/inventoryImportCleanup.js';

let ready = false;
const app = createApp({ isReady: () => ready });
const server = http.createServer(app);
const io = new Server(server);
initSocket(io);
const stopImportCleanup = startInventoryImportCleanup();

const shutdown = registerServerLifecycle({
    server, io, prisma, logger,
    setReady: value => { ready = value; }, beforeDisconnect: stopImportCleanup
});

server.on('error', err => {
    logger.error({ err }, 'Error del servidor HTTP');
    process.exitCode = 1;
    void shutdown('server-error');
});

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
    ready = true;
    logger.info({ port }, 'Servidor escuchando');
});

process.on('warning', warning => {
    logger.warn({ warning }, 'Warning detectado');
});
