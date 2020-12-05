import Startable from 'startable';
import { EventEmitter } from 'events';
import WsServer from './ws-server';
import { BtcUsdt } from './btc-usdt';
import { BtcUsdSwapUsd } from './btc-usd-swap-usd';
import { Deserializer } from './deserializer';
class PublicAgentOkexWebsocket extends Startable {
    constructor() {
        super(...arguments);
        this.broadcast = new EventEmitter();
        this.deserializer = new Deserializer();
        this.btcUsdt = new BtcUsdt(this.deserializer, this.broadcast);
        this.btcUsdSwapUsd = new BtcUsdSwapUsd(this.deserializer, this.broadcast);
        this.wsServer = new WsServer(this.broadcast);
    }
    async _start() {
        this.deserializer.on('error', console.error);
        await this.deserializer.start(err => void this.stop(err).catch(() => { }));
        await this.btcUsdt.start(err => void this.stop(err).catch(() => { }));
        await this.btcUsdSwapUsd.start(err => void this.stop(err).catch(() => { }));
        await this.wsServer.start(err => void this.stop(err).catch(() => { }));
    }
    async _stop() {
        await this.btcUsdt.stop();
        await this.btcUsdSwapUsd.stop();
        await this.wsServer.stop();
        await this.deserializer.stop();
    }
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
//# sourceMappingURL=public-agent.js.map