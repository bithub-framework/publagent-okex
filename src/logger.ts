import winston from 'winston';
import path from 'path';
import process from 'process';

process.on('unhandledRejection', (reason, promise) => { throw reason; });

const logDir = path.join(__dirname, '../log/');

const errorFile = new winston.transports.File({
    filename: 'error.log',
    dirname: logDir
});

const uncaughtFile = new winston.transports.File({
    filename: 'uncaught.log',
    dirname: logDir
});

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    transports: [errorFile],
    exceptionHandlers: [uncaughtFile],
    exitOnError: false,
});

process.on('beforeExit', () => void logger.end());

export default logger;