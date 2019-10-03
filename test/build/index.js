"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const __1 = __importDefault(require("../../"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const bluebird_1 = __importDefault(require("bluebird"));
const config = fs_extra_1.default.readJsonSync(path_1.default.join(__dirname, '../../cfg/config.json'));
ava_1.default.serial('1', (t) => __awaiter(this, void 0, void 0, function* () {
    console.log = t.log;
    console.info = t.log;
    console.error = t.log;
    const qAOW = new __1.default();
    yield qAOW.start();
    let latest = 0;
    for (let i = 1; i <= 5; i++) {
        yield axios_1.default
            .get(`http://localhost:${config.QUOTE_CENTER_PORT}/trades`, {
            params: {
                exchange: 'okex',
                pair: 'btc.usdt',
                from: latest,
            }
        }).then(res => {
            const trades = res.data;
            t.log(trades);
            if (trades.length)
                latest = trades[trades.length - 1].id;
        }).catch(err => {
            t.log(err.stack);
        });
        yield bluebird_1.default.delay(1000);
    }
    yield qAOW.stop();
}));
//# sourceMappingURL=index.js.map