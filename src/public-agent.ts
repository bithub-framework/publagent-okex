import Startable from 'startable';
import { EventEmitter } from 'events';
import WsServer from './ws-server';
import { BtcUsdt } from './btc-usdt';
import { BtcUsdSwapUsd } from './btc-usd-swap-usd';
import { Deserializer } from './deserializer';

class PublicAgentOkexWebsocket extends Startable {
    private broadcast = new EventEmitter();
    private deserializer = new Deserializer();
    private btcUsdt = new BtcUsdt(
        this.deserializer,
        this.broadcast,
    );
    private btcUsdSwapUsd = new BtcUsdSwapUsd(
        this.deserializer,
        this.broadcast,
    );
    private wsServer = new WsServer(this.broadcast);

    protected async _start(): Promise<void> {
        this.deserializer.on('error', console.error);
        await this.deserializer.start(err => void this.stop(err).catch(() => { }));
        await this.btcUsdt.start(err => void this.stop(err).catch(() => { }));
        await this.btcUsdSwapUsd.start(err => void this.stop(err).catch(() => { }));
        await this.wsServer.start(err => void this.stop(err).catch(() => { }));
    }

    protected async _stop(): Promise<void> {
        await this.btcUsdt.stop();
        await this.btcUsdSwapUsd.stop();
        await this.wsServer.stop();
        await this.deserializer.stop();
    }
}

export {
    PublicAgentOkexWebsocket as default,
    PublicAgentOkexWebsocket,
};
