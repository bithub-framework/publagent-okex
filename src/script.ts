import { adaptor } from 'startable-adaptor';
import { lockPidFile } from 'lock-pid-file';
import { PublagentOkex } from './agent';
import { OkexSpotBtcUsdt } from './okex-spot-btc-usdt';
import { OkexPerpetualBtcUsdt } from './okex-perpetual-btc-usdt';

const agent = new PublagentOkex([
    OkexSpotBtcUsdt,
    OkexPerpetualBtcUsdt,
]);

lockPidFile('publagent-okex');

adaptor(agent);

