"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const process_1 = __importDefault(require("process"));
const file = new winston_1.default.transports.File({
    filename: 'error.log',
    dirname: path_1.default.join(__dirname, '../log/'),
});
const logger = winston_1.default.createLogger({
    level: 'silly',
    format: winston_1.default.format.json(),
    transports: [file],
    exceptionHandlers: [file],
});
process_1.default.on('beforeExit', () => void logger.end());
exports.default = logger;
//# sourceMappingURL=logger.js.map