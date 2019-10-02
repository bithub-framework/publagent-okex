import V3WebsocketClient from './official-v3-websocket-client';
import WebSocket from 'ws';
import fse from 'fs-extra';
import path from 'path';
import { flow as pipe } from 'lodash';
import {
    Trade, Orderbook,
    QuoteDataFromAgentToCenter as QDFATC,
} from 'interfaces';
import SubscriberTrade from './subscriber-trade';
import SubscriberOrderbook from './subscriber-orderbook';
import logger from 'console';
import Autonomous from 'autonomous';
import { RawErrorData } from './interface';
import EventEmitter from 'events';

const config: {
    QUOTE_CENTER_PORT: number,
} = fse.readJsonSync(path.join(__dirname, '../cfg/config.json'));

class QuoteAgentOkexWebsocket extends Autonomous {
    private okex!: V3WebsocketClient;
    private center!: WebSocket;
    private subscriberTrade!: SubscriberTrade;
    private subscriberOrderbook!: SubscriberOrderbook;

    protected async _start(): Promise<void> {
        await this.connectOkex();
        await this.connectQuoteCenter();
        this.subscribeTrade();
        this.subscribeOrderbook();
    }

    protected async _stop(): Promise<void> {
        this.okex.close();
        this.center.close();
    }

    private async connectQuoteCenter(): Promise<void> {
        this.center = new WebSocket(
            `ws://localhost:${config.QUOTE_CENTER_PORT}`);
        await EventEmitter.once(this.center, 'open');

        this.center.on('error', (err: Error) => {
            logger.error(err);
            this.stop();
        });
    }

    private async connectOkex(): Promise<void> {
        this.okex = new V3WebsocketClient();
        this.okex.connect();

        // 会自动处理 'error' 事件，详见文档。
        await EventEmitter.once(this.okex, 'open');

        this.okex.on('message', msg =>
            void this.okex.emit('rawData', JSON.parse(msg)));
        this.okex.on('rawData', (raw: RawErrorData) => {
            if ((<any>raw).event !== 'error') return;
            logger.error(new Error(raw.message));
            this.stop();
        });
        this.okex.on('error', (err: Error) => {
            logger.error(err);
            this.stop();
        });
    }

    private subscribeTrade(): void {
        this.subscriberTrade = new SubscriberTrade(this.okex);
        this.subscriberTrade.on('data', pipe(
            (trades: Trade[]): QDFATC => ({
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                trades,
            }),
            JSON.stringify,
            (data: string) => this.center.send(data),
        ));
        this.subscriberTrade.on('error', (err: Error) => {
            logger.error(err);
            this.stop();
        });
    }

    private subscribeOrderbook(): void {
        this.subscriberOrderbook = new SubscriberOrderbook(this.okex);
        this.subscriberOrderbook.on('data', pipe(
            (orderbook: Orderbook): QDFATC => ({
                exchange: 'okex',
                pair: ['btc', 'usdt'],
                orderbook,
            }),
            JSON.stringify,
            (data: string) => this.center.send(data),
        ));
        this.subscriberOrderbook.on('error', (err: Error) => {
            logger.error(err);
            this.stop();
        });
    }
}

export default QuoteAgentOkexWebsocket;