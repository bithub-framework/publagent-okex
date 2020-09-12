import Startable from 'startable';
import EventEmitter from 'events';
import { marketDescriptors, } from './market-descriptions';
import Normalizer from './normalizer';
import WsServer from './ws-server';
class PublicAgentOkexWebsocket extends Startable {
    constructor() {
        super(...arguments);
        this.broadcast = new EventEmitter();
        this.normalizer = new Normalizer();
        this.wsServer = new WsServer(this.broadcast);
    }
    async _start() {
        this.normalizer.on('error', console.error);
        await this.normalizer.start(err => {
            if (err) {
                console.error(err);
                this.stop(new Error('OKEX closed.'));
            }
        });
        this.normalizer.on('trades', (pair, trades) => {
            this.broadcast.emit(`okex/${pair}/tardes`, trades);
        });
        this.normalizer.on('orderbook', (pair, orderbook) => {
            this.broadcast.emit(`okex/${pair}/orderbook`, orderbook);
        });
        for (const pair in marketDescriptors)
            await this.normalizer.unSubscribe('subscribe', pair);
        await this.wsServer.start(err => void this.stop(err));
    }
    async _stop() {
        await this.wsServer.stop();
        await this.normalizer.stop();
    }
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
//# sourceMappingURL=public-agent.js.map