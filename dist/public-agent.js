import PromisifiedWebSocket from 'promisified-websocket';
import Startable from 'startable';
import { marketDescriptors, } from './market-descriptions';
import config from './config';
import Normalizer from './normalizer';
class PublicAgentOkexWebsocket extends Startable {
    constructor() {
        super(...arguments);
        this.normalizer = new Normalizer(config.OKEX_WEBSOCKET_URL);
        this.center = {};
    }
    async _start() {
        await this.connectOkex();
        await this.connectPublicCenter();
        this.normalizer.on('trades', (pair, trades) => void this.onTrades(pair, trades).catch(err => void this.stop(err)));
        this.normalizer.on('orderbook', (pair, orderbook) => void this.onOrderbook(pair, orderbook).catch(err => void this.stop(err)));
        await this.subscribe();
    }
    async _stop() {
        if (this.normalizer)
            await this.normalizer.stop();
        for (const center of Object.values(this.center))
            await center.stop();
    }
    async connectOkex() {
        this.normalizer.on('error', console.error);
        await this.normalizer.start(err => {
            if (err) {
                console.error(err);
                this.stop(new Error('OKEX closed.'));
            }
        });
    }
    async connectPublicCenter() {
        for (const pair in marketDescriptors) {
            const center = this.center[pair] = new PromisifiedWebSocket(`${config.PUBLIC_CENTER_BASE_URL}/okex/${pair}`);
            center.on('error', console.error);
            await center.start(err => {
                if (err) {
                    console.error(err);
                    this.stop(new Error(`Public center for ${pair} closed.`));
                }
            });
        }
    }
    async onTrades(pair, trades) {
        const dataSent = { trades };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }
    async onOrderbook(pair, orderbook) {
        const dataSent = { orderbook };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }
    async subscribe() {
        for (const pair in marketDescriptors)
            await this.normalizer.unSubscribe('subscribe', pair);
    }
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
//# sourceMappingURL=public-agent.js.map