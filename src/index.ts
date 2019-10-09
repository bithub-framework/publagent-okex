import WebSocket from 'ws';
import fse from 'fs-extra';
import path from 'path';
import Autonomous from 'autonomous';
import { once } from 'events';
import { boundMethod } from 'autobind-decorator';
import V3WebsocketClient from './official-v3-websocket-client';
import RawOrderbookHandler from './raw-orderbook-handler';
import { formatRawTrades } from './raw-trades-handler';
import {
    RawOrderbook,
    RawTrades,
    QuoteDataFromAgentToCenter as QDFATC,
    Config,
} from './interfaces';

const config: Config = fse.readJsonSync(path.join(__dirname, '../cfg/config.json'));

type RawData = any;

const ACTIVE_CLOSE = 4000;

class QuoteAgentOkexWebsocket extends Autonomous {
    private okex!: V3WebsocketClient;
    private center!: WebSocket;
    private rawOrderbookHandler = new RawOrderbookHandler();

    protected async _start(): Promise<void> {
        await this.connectOkex();
        await this.connectQuoteCenter();

        this.okex.on('rawData', this.onRawData);

        await this.subscribeTrades();
        await this.subscribeOrderbook();
    }

    protected async _stop(): Promise<void> {
        if (this.okex) this.okex.close();
        if (this.center && this.center.readyState !== 3) {
            this.center.close(ACTIVE_CLOSE);
            await once(this.center, 'close');
        }
    }

    private async connectQuoteCenter(): Promise<void> {
        this.center = new WebSocket(
            `ws://localhost:${config.QUOTE_CENTER_PORT}/okex/btc.usdt`);

        this.center.on('close', code => {
            if (code !== ACTIVE_CLOSE)
                this.center.emit('error', new Error('quote center closed'));
        });
        this.center.on('error', (err: Error) => {
            console.error(err);
            this.stop();
        });

        await once(this.center, 'open');
    }

    private async connectOkex(): Promise<void> {
        this.okex = new V3WebsocketClient(config.OKEX_URL);

        this.okex.on('message', (msg: string) =>
            void this.okex.emit('rawData', JSON.parse(msg)));
        this.okex.on('rawData', (raw: RawData) => {
            if (raw.event === 'error')
                this.okex.emit('error', new Error(raw.message));
        });
        this.okex.on('close', () => {
            this.okex.emit('error', new Error('okex closed'));
        })
        this.okex.on('error', (err: Error) => {
            console.error(err);
            this.stop();
        });

        this.okex.connect();
        await once(this.okex, 'open');
    }

    @boundMethod
    private onRawData(raw: RawData): void {
        if (raw.table === 'spot/trade') this.onRawTrades(raw);
        if (raw.table === 'spot/depth') this.onRawOrderbook(raw);
    }

    private onRawTrades(rawTrades: RawTrades): void {
        const trades = formatRawTrades(rawTrades);
        const sentData: QDFATC = { trades };
        this.center.send(JSON.stringify(sentData));
    }

    private onRawOrderbook(rawOrderbook: RawOrderbook): void {
        const orderbook = this.rawOrderbookHandler.handle(rawOrderbook);
        const sentData: QDFATC = { orderbook };
        this.center.send(JSON.stringify(sentData));
    }

    private async subscribeTrades(): Promise<void> {
        this.okex.subscribe('spot/trade:BTC-USDT');
        const onTradesSub = (raw: RawData) => {
            if (
                raw.channel === 'spot/trade:BTC-USDT'
                && raw.event === 'subscribe'
            ) this.okex.emit('trades subscribed');
        }
        this.okex.on('rawData', onTradesSub);
        await once(this.okex, 'trades subscribed');
        this.okex.off('rawData', onTradesSub);
    }

    private async subscribeOrderbook(): Promise<void> {
        this.okex.subscribe('spot/depth:BTC-USDT');
        const onOrderbookSub = (raw: RawData) => {
            if (
                raw.channel === 'spot/depth:BTC-USDT'
                && raw.event === 'subscribe'
            ) this.okex.emit('orderbook subscribed');
        }
        this.okex.on('rawData', onOrderbookSub);
        await once(this.okex, 'orderbook subscribed');
        this.okex.off('rawData', onOrderbookSub);
    }
}

export default QuoteAgentOkexWebsocket;