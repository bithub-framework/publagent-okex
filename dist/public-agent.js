import Startable from 'startable';
import EventEmitter from 'events';
import WsServer from './ws-server';
import BtcUsdt from './btc-usdt';
import RawExtractor from './raw-extractor';
class PublicAgentOkexWebsocket extends Startable {
    constructor() {
        super(...arguments);
        this.broadcast = new EventEmitter();
        this.rawExtractor = new RawExtractor();
        this.btcUsdt = new BtcUsdt(this.rawExtractor, this.broadcast);
        this.wsServer = new WsServer(this.broadcast);
    }
    async _start() {
        this.rawExtractor.on('error', console.error);
        await this.btcUsdt.start(err => this.stop(err));
        await this.wsServer.start(err => void this.stop(err));
    }
    async _stop() {
        await this.wsServer.stop();
        await this.btcUsdt.stop();
        await this.rawExtractor.stop();
    }
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
//# sourceMappingURL=public-agent.js.map