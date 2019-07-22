import winston from 'winston';
import path from 'path';
import process from 'process';

const file = new winston.transports.File({
    filename: 'error.log',
    dirname: path.join(__dirname, '../log/'),
});

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    transports: [file],
    exceptionHandlers: [file],
});

process.on('beforeExit', () => void logger.end());

export default logger;