import PromisifiedWebSocket from './promisified-websocket';
import Startable from 'startable';
import {
    DataFromPublicAgentToCenter as DFPATC,
    Trade,
    Orderbook,
} from './interfaces';
import {
    marketDescriptors,
    Pair,
} from './market-descriptions';
import config from './config';
import Normalizer from './normalizer';

class PublicAgentOkexWebsocket extends Startable {
    private normalizer = new Normalizer(config.OKEX_WEBSOCKET_URL);
    private center: {
        [key: string]: PromisifiedWebSocket;
    } = {};

    protected async _start(): Promise<void> {
        await this.connectOkex();
        await this.connectPublicCenter();
        this.normalizer.on('trades', this.onTrades);
        this.normalizer.on('orderbook', this.onOrderbook);
        await this.subscribeTrades();
        await this.subscribeOrderbook();
    }

    protected async _stop(): Promise<void> {
        if (this.normalizer) await this.normalizer.stop();
        for (const center of Object.values(this.center)) {
            await center.stop();
        }
    }

    private async connectOkex(): Promise<void> {
        this.normalizer.on('error', console.error);
        await this.normalizer.start(err => {
            if (err) {
                console.error(err);
                this.stop(new Error('OKEX closed.'));
            }
        });
    }

    private async connectPublicCenter(): Promise<void> {
        for (const pair in marketDescriptors) {
            const center = this.center[<Pair>pair] = new PromisifiedWebSocket(
                `${config.PUBLIC_CENTER_BASE_URL}/okex/${<Pair>pair}`);
            center.on('error', console.error);
            await center.start(err => {
                if (err) {
                    console.error(err);
                    this.stop(new Error(`Public center for ${pair} closed.`));
                }
            });

        }
    }

    private async onTrades(pair: Pair, trades: Trade[]): Promise<void> {
        const dataSent: DFPATC = { trades, };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }

    private async onOrderbook(pair: Pair, orderbook: Orderbook): Promise<void> {
        const dataSent: DFPATC = { orderbook, };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }

    private async subscribeTrades(): Promise<void> {
        for (const { tradesChannel } of Object.values(marketDescriptors)) {
            await this.normalizer.unSubscribe('subscribe', tradesChannel);
        }
    }

    private async subscribeOrderbook(): Promise<void> {
        for (const { orderbookChannel } of Object.values(marketDescriptors))
            await this.normalizer.unSubscribe('subscribe', orderbookChannel);
    }
}

export {
    PublicAgentOkexWebsocket as default,
    PublicAgentOkexWebsocket,
};