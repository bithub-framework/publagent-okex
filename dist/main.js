"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const timers_1 = __importDefault(require("timers"));
const agent = new index_1.default();
agent.start()
    .then(() => {
    timers_1.default.setTimeout(() => {
        agent.stop();
    }, 10000);
}).catch(err => {
    console.log(err);
});
//# sourceMappingURL=main.js.map