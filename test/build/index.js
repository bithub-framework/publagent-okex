"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const startable_1 = require("startable");
const lock_pid_file_1 = require("lock-pid-file");
const WebSocket = require("ws");
const path_1 = require("path");
const agent_1 = require("../../build/agent");
const okex_spot_btc_usdt_1 = require("../../build/okex-spot-btc-usdt");
const okex_perpetual_btc_usdt_1 = require("../../build/okex-perpetual-btc-usdt");
const agent = new agent_1.PublagentOkex([
    okex_spot_btc_usdt_1.OkexSpotBtcUsdt,
    okex_perpetual_btc_usdt_1.OkexPerpetualBtcUsdt,
]);
lock_pid_file_1.lockPidFile('publagent-okex');
startable_1.adaptor(agent);
agent.start().then(() => {
    console.log('Started');
}, () => { });
const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
const socketFilePath = path_1.join(XDG_RUNTIME_DIR, `okex-spot-btc-usdt.socket`);
const ws = new WebSocket(`ws+unix://${socketFilePath}:/trades`);
ws.on('message', console.log);
//# sourceMappingURL=index.js.map