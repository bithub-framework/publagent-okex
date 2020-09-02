import PromisifiedWebSocket from './promisified-websocket';
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
        this.normalizer.on('trades', this.onTrades);
        this.normalizer.on('orderbook', this.onOrderbook);
        await this.subscribeTrades();
        await this.subscribeOrderbook();
    }
    async _stop() {
        if (this.normalizer)
            await this.normalizer.stop();
        for (const center of Object.values(this.center)) {
            await center.stop();
        }
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
        const dataSent = { trades, };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }
    async onOrderbook(pair, orderbook) {
        const dataSent = { orderbook, };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }
    async subscribeTrades() {
        for (const { tradesChannel } of Object.values(marketDescriptors)) {
            await this.normalizer.unSubscribe('subscribe', tradesChannel);
        }
    }
    async subscribeOrderbook() {
        for (const { orderbookChannel } of Object.values(marketDescriptors))
            await this.normalizer.unSubscribe('subscribe', orderbookChannel);
    }
}
export { PublicAgentOkexWebsocket as default, PublicAgentOkexWebsocket, };
//# sourceMappingURL=public-agent.js.map