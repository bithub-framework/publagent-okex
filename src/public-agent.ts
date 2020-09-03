import PromisifiedWebSocket from 'promisified-websocket';
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
        this.normalizer.on('trades', (pair, trades) =>
            void this.onTrades(pair, trades).catch(err => void this.stop(err)));
        this.normalizer.on('orderbook', (pair, orderbook) =>
            void this.onOrderbook(pair, orderbook).catch(err => void this.stop(err)));
        await this.subscribe();
    }

    protected async _stop(): Promise<void> {
        if (this.normalizer) await this.normalizer.stop();
        for (const center of Object.values(this.center)) await center.stop();
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
        const dataSent: DFPATC = { trades };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }

    private async onOrderbook(pair: Pair, orderbook: Orderbook): Promise<void> {
        const dataSent: DFPATC = { orderbook };
        await this.center[pair].send(JSON.stringify(dataSent))
            .catch(err => void this.stop(err));
    }

    private async subscribe(): Promise<void> {
        for (const pair in marketDescriptors)
            await this.normalizer.unSubscribe('subscribe', <Pair>pair);
    }
}

export {
    PublicAgentOkexWebsocket as default,
    PublicAgentOkexWebsocket,
};