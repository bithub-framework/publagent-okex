import Startable from 'startable';
import EventEmitter from 'events';
import WsServer from './ws-server';
import BtcUsdt from './btc-usdt';
import RawExtractor from './raw-extractor';

class PublicAgentOkexWebsocket extends Startable {
    private broadcast = new EventEmitter();
    private rawExtractor = new RawExtractor();
    private btcUsdt = new BtcUsdt(
        this.rawExtractor,
        this.broadcast,
    );
    private wsServer = new WsServer(this.broadcast);

    protected async _start(): Promise<void> {
        this.rawExtractor.on('error', console.error);
        await this.btcUsdt.start(err => this.stop(err));
        await this.wsServer.start(err => void this.stop(err));
    }

    protected async _stop(): Promise<void> {
        await this.wsServer.stop();
        await this.btcUsdt.stop();
        await this.rawExtractor.stop();
    }
}

export {
    PublicAgentOkexWebsocket as default,
    PublicAgentOkexWebsocket,
};
