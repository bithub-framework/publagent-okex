import { adaptor } from 'startable-adaptor';
import { lockPidFile } from 'lock-pid-file';
import WebSocket = require('ws');
import { join } from 'path';
import { PublagentOkex } from '../../build/agent';
import { OkexSpotBtcUsdt } from '../../build/okex-spot-btc-usdt';
import { OkexPerpetualBtcUsdt } from '../../build/okex-perpetual-btc-usdt';

const agent = new PublagentOkex([
    OkexSpotBtcUsdt,
    OkexPerpetualBtcUsdt,
]);

lockPidFile('publagent-okex');

adaptor(agent);

agent.start().then(() => {
    console.log('Started');

    const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
    const socketFilePath = join(<string>XDG_RUNTIME_DIR, `okex-spot-btc-usdt.socket`);
    const ws = new WebSocket(`ws+unix://${socketFilePath}:/trades`);
    ws.on('message', console.log);

}, () => { });



