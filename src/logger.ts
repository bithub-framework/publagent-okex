import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({
            filename: 'error.log',
            dirname: path.join(__dirname, '../log/'),
        })
    ]
});

export default logger;