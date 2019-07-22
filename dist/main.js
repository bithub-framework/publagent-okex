"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const logger_1 = __importDefault(require("./logger"));
const process_1 = __importDefault(require("process"));
const agent = new index_1.default();
agent.start()
    .then(() => void process_1.default.once('SIGINT', () => {
    process_1.default.once('SIGINT', () => void process_1.default.exit(-1));
    agent.stop();
}))
    .catch((err) => {
    logger_1.default.error(err);
});
//# sourceMappingURL=main.js.map