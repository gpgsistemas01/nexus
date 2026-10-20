// import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import { ipKeyGenerator } from 'express-rate-limit';
// import Redis from 'ioredis';

// const redisClient = new Redis({
//     host: '127.0.0.1',
//     port: 6379
// });

// export const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 min
//     max: 100,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:api:'
//     }),
//     handler: (req, res) => {

//         res.status(429).json({
//             message: 'Demasiadas solicitudes desde tu IP. Espera 15 minutos.'
//         });
//     }
// });

// export const emailLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hore
//     max: 3,
//     standardHeaders: true,
//     legacyHeaders: false,
//     keyGenerator: (req, res) => (req.body.email || '').trim().toLowerCase() || ipKeyGenerator(req.ip),
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:email:'
//     }),
//     handler: (req, res) => {
        
//         res.status(429).json({
//             message: 'Has superado el límite de intentos permitidos con este correo. Espera 1 hora.'
//         });
//     }
// });

// export const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 5,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:login:'
//     }),
//     handler: (req, res) => {

//         res.status(429).json({
//             message: 'Has superado el límite de intentos permitidos. Espera 5 minutos.'
//         });
//     }
// });

// export const registerLimiter = rateLimit({
//     windowMs: 60 * 1000, //1 hore
//     max: 10,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:register:'
//     }),
//     handler: (req, res) => {

//         res.status(429).json ({
//             message: 'Has superado el límite de registros permitidos. Espera 1 hora.'
//         });
//     }
// });

// export const recoverLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 3,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:recover:'
//     }),
//     handler: (req, res) => {

//         res.status(429).json({
//             message: 'Has solicitado demasiadas recuperaciones de contraseña. Espera 15 minutos.'
//         });
//     }
// });

// export const resetLimiter = rateLimit({
//     windowMs: 60 * 60 * 1000, // 1 hore
//     max: 5,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:reset:'
//     }),
//     handler: (req, res) => {

//         res.status(429).json({
//             message: 'Has solicitado demasiados cambios de contraseña. Espera 1 hora.'
//         });
//     }
// });

// export const verifyLimiter = rateLimit({
//     windowMs: 30 * 60 * 1000, // 30 min
//     max: 10,
//     standardHeaders: true,
//     legacyHeaders: false,
//     store: new RedisStore({
//         sendCommand: (...args) => redisClient.call(...args),
//         prefix: 'ratelimit:verify:'
//     }),
//     handler: (req, res) => {

//         res.status(429).json({
//             message: 'Has solicitado demasiados cambios de contraseña. Espera 1 hora.'
//         });
//     }
// });