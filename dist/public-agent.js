import Startable from 'startable';
import EventEmitter from 'events';
import WsServer from './ws-server';
import BtcUsdt from './btc-usdt';
import Deserializer from './deserializer';
class PublicAgentOkexWebsocket extends Startable {
    constructor() {
        super(...arguments);
        this.broadcast = new EventEmitter();
        this.deserializer = new Deserializer();
        this.btcUsdt = new BtcUsdt(this.deserializer, this.broadcast);
        this.wsServer = new WsServer(this.broadcast);
    }
    async _start() {
        this.deserializer.on('error', console.error);
        console.log(1);
        await this.deserializer.start(err => this.stop(err));
        console.log(2);
        await this.btcUsdt.start(err => this.stop(err));
        console.log(3);
        await this.wsServer.start(err => this.stop(err));
        console.log(4);
    }
    async _stop() {
        await this.wsServer.stop();
        await this.btcUsdt.stop();
        await this.deserializer.stop();
    }
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
//# sourceMappingURL=public-agent.js.map