import pino from 'pino';
import pinoHttp from 'pino-http';

const isProduction = process.env.TYPE_ENTORN === 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname'
            }
        }
});

export const pinoLogger = pinoHttp({
    logger,
    redact: [
        'req.headers.cookie',
        'req.headers.authorization'
    ]
});