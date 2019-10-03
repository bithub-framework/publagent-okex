import V3WebsocketClient from './official-v3-websocket-client';
import WebSocket from 'ws';
import fse from 'fs-extra';
import path from 'path';
import {
    Trade, Orderbook,
    QuoteDataFromAgentToCenter as QDFATC,
} from 'interfaces';
import SubscriberTrades from './subscriber-trades';
import SubscriberOrderbook from './subscriber-orderbook';
import Autonomous from 'autonomous';
import { RawErrorData } from './interfaces';
import EventEmitter from 'events';

const config: {
    QUOTE_CENTER_PORT: number;
    OKEX_URL: string;
} = fse.readJsonSync(path.join(__dirname, '../cfg/config.json'));

class QuoteAgentOkexWebsocket extends Autonomous {
    private okex!: V3WebsocketClient;
    private center!: WebSocket;
    private subscriberTrade!: SubscriberTrades;
    private subscriberOrderbook!: SubscriberOrderbook;

    protected async _start(): Promise<void> {
        await this.connectOkex();
        await this.connectQuoteCenter();
        this.subscribeTrades();
        this.subscribeOrderbook();
    }

    protected async _stop(): Promise<void> {
        if (this.okex) this.okex.close();
        if (this.center) this.center.close();
    }

    private async connectQuoteCenter(): Promise<void> {
        this.center = new WebSocket(
            `ws://localhost:${config.QUOTE_CENTER_PORT}`);
        await EventEmitter.once(this.center, 'open');
        console.log('quote center connected');

        this.center.on('error', (err: Error) => {
            console.error(err);
            this.stop();
        });
        this.center.on('close', () => {
            console.error(new Error('quote center closed'));
            this.stop();
        });
    }

    private async connectOkex(): Promise<void> {
        this.okex = new V3WebsocketClient(config.OKEX_URL);
        this.okex.connect();

        // 会自动处理 'error' 事件，详见文档。
        await EventEmitter.once(this.okex, 'open');
        console.log('okex connected');

        this.okex.on('message', msg =>
            void this.okex.emit('rawData', JSON.parse(msg)));
        this.okex.on('rawData', (raw: RawErrorData) => {
            if ((<any>raw).event !== 'error') return;
            console.error(new Error(raw.message));
            this.stop();
        });
        this.okex.on('error', (err: Error) => {
            console.error(err);
            this.stop();
        });
        this.okex.on('close', () => {
            console.log(new Error('okex closed'));
            this.stop();
        })
    }

    private subscribeTrades(): void {
        this.subscriberTrade = new SubscriberTrades(this.okex);
        this.subscriberTrade.on('data', (trades: Trade[]) => {
            const data: QDFATC = {
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                trades,
            };
            void this.center.send(JSON.stringify(data));
        });
        this.subscriberTrade.on('error', (err: Error) => {
            console.error(err);
            this.stop();
        });

        this.subscriberTrade.on('subscribed', () =>
            void console.log('trade subscribed'));
    }

    private subscribeOrderbook(): void {
        this.subscriberOrderbook = new SubscriberOrderbook(this.okex);
        this.subscriberOrderbook.on('data', (orderbook: Orderbook) => {
            const data: QDFATC = {
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                orderbook,
            };
            void this.center.send(JSON.stringify(data));
        });
        this.subscriberOrderbook.on('error', (err: Error) => {
            console.error(err);
            this.stop();
        });

        this.subscriberOrderbook.on('subscribed', () =>
            void console.log('orderbook subscribed'));
    }
}

export default QuoteAgentOkexWebsocket;