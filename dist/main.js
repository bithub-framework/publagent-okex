"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const autonomous_1 = require("autonomous");
const index_1 = __importDefault(require("./index"));
const pandora_kita_1 = require("pandora-kita");
autonomous_1.pandora2Pm2([
    pandora_kita_1.PandoraKita,
    index_1.default,
]);
//# sourceMappingURL=main.js.map