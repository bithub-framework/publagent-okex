"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const startable_adaptor_1 = require("startable-adaptor");
const lock_pid_file_1 = require("lock-pid-file");
const agent_1 = require("./agent");
const okex_spot_btc_usdt_1 = require("./okex-spot-btc-usdt");
const okex_perpetual_btc_usdt_1 = require("./okex-perpetual-btc-usdt");
const agent = new agent_1.PublagentOkex([
    okex_spot_btc_usdt_1.OkexSpotBtcUsdt,
    okex_perpetual_btc_usdt_1.OkexPerpetualBtcUsdt,
]);
lock_pid_file_1.lockPidFile('publagent-okex');
startable_adaptor_1.adaptor(agent);
//# sourceMappingURL=script.js.map