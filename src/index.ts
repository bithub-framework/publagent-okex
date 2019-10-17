import WebSocket from 'ws';
import { readJsonSync } from 'fs-extra';
import { join } from 'path';
import Autonomous from 'autonomous';
import { once } from 'events';
import axios from 'axios';
import { boundMethod } from 'autobind-decorator';
import V3WebsocketClient from './official-v3-websocket-client-modified';
import RawOrderbookHandler from './raw-orderbook-handler';
import formatRawTrade from './raw-trades-handler';
import {
    RawOrderbook,
    RawTrades,
    PublicDataFromAgentToCenter as PDFATC,
    Config,
    RawInstrument,
} from './interfaces';
import {
    marketDescriptors,
    getChannel,
    getPair,
    MarketDescriptor,
} from './mapping';

const config: Config = readJsonSync(join(__dirname,
    '../cfg/config.json'));

type RawData = any;

const ACTIVE_CLOSE = 4000;

class PublicAgentOkexWebsocket extends Autonomous {
    private okex!: V3WebsocketClient;
    private center: {
        [key: string]: WebSocket;
    } = {};
    private rawOrderbookHandler: {
        [key: string]: RawOrderbookHandler;
    } = {};

    protected async _start(): Promise<void> {
        await this.connectOkex();
        await this.connectPublicCenter();

        this.okex.on('rawData', this.onRawData);
        await this.getInstruments();
        await this.subscribeInstruments();
        await this.subscribeTrades();
        await this.subscribeOrderbook();
    }

    protected async _stop(): Promise<void> {
        if (this.okex) this.okex.close(ACTIVE_CLOSE);
        for (const pair in marketDescriptors) {
            const center = this.center[pair];
            if (center.readyState < 2) center.close(ACTIVE_CLOSE);
            if (center.readyState < 3) await once(center, 'close');
        }
    }

    private async connectPublicCenter(): Promise<void> {
        for (const pair in marketDescriptors) {
            const center = this.center[pair] = new WebSocket(
                `${config.PUBLIC_CENTER_BASE_URL}/okex/${pair}`);

            center.on('close', (code?, reason?) => {
                if (code !== ACTIVE_CLOSE) {
                    console.error(new Error(
                        `public center for ${pair} closed`
                    ));
                    this.stop();
                }
            });
            center.on('error', console.error);

            await once(center, 'open');
        }
    }

    private async connectOkex(): Promise<void> {
        this.okex = new V3WebsocketClient(config.OKEX_WEBSOCKET_URL);

        this.okex.on('message', (msg: string) =>
            void this.okex.emit('rawData', JSON.parse(msg)));
        this.okex.on('rawData', (raw: RawData) => {
            if (raw.event === 'error')
                this.okex.emit('error', new Error(raw.message));
        });
        this.okex.on('close', (code?: number, reason?: string) => {
            if (code !== ACTIVE_CLOSE) {
                console.error(new Error('okex closed'));
                this.stop();
            }
        })
        this.okex.on('error', (err: Error) => {
            console.error(err);
        });

        this.okex.connect();
        await once(this.okex, 'open');
    }

    private async getInstruments(): Promise<void> {
        const rawInstrumentData: RawInstrument['data'][0]
            = await axios(`${
                config.OKEX_RESTFUL_BASE_URL}${
                config.OKEX_RESTFUL_URL_INSTRUMENTS}`
            ).then(res => res.data);
        this.onRawInstrumentsData(rawInstrumentData);
    }

    @boundMethod
    private onRawData(raw: RawData): void {
        try {
            const { table } = raw;
            if (!table) return;
            const channel = getChannel(table);
            if (channel === 'trades') {
                for (const rawTrade of raw.data) {
                    const { instrument_id } = rawTrade;
                    const pair = getPair(table, instrument_id);
                    this.onRawTradeData(pair, rawTrade);
                }
            }
            if (channel === 'orderbook') {
                for (const rawOrderbookData of raw.data) {
                    const { instrument_id } = rawOrderbookData;
                    const pair = getPair(table, instrument_id);
                    this.onRawOrderbookData(pair, rawOrderbookData);
                }
            }
            if (channel === 'instruments') {
                this.onRawInstrumentsData(raw.data[0], true);
            }
        } catch (err) {
            console.error(err);
            this.stop();
        }
    }

    private async onRawInstrumentsData(
        rawInstrumentData: RawInstrument['data'][0],
        subscribe = false,
    ) {
        for (const instrument of rawInstrumentData) {
            if (!(
                instrument.underlying_index === 'BTC'
                && instrument.quote_currency === 'USD'
            )) continue;
            const marketDescriptor: MarketDescriptor = {
                instrumentId: instrument.instrument_id,
                tradesChannel: `futures/trade:${
                    instrument.instrument_id}`,
                orderbookChannel: `futures/depth:${
                    instrument.instrument_id}`,
            };
            try {
                let pair: string;

                pair = 'BTC-USD-THIS-WEEK/USD';
                if (
                    instrument.alias === 'this_week'
                    && instrument.instrument_id
                    !== marketDescriptors[pair].instrumentId
                ) {
                    marketDescriptors[pair] = marketDescriptor;
                    if (subscribe) {
                        await this.subscribeTrades(pair);
                        await this.subscribeOrderbook(pair);
                    }
                }

                pair = 'BTC-USD-NEXT-WEEK/USD';
                if (
                    instrument.alias === 'next_week'
                    && instrument.instrument_id
                    !== marketDescriptors[pair].instrumentId
                ) {
                    marketDescriptors[pair] = marketDescriptor;
                    if (subscribe) {
                        await this.subscribeTrades(pair);
                        await this.subscribeOrderbook(pair);
                    }
                }

                pair = 'BTC-USD-QUARTER/USD';
                if (
                    instrument.alias === 'quarter'
                    && instrument.instrument_id
                    !== marketDescriptors[pair].instrumentId
                ) {
                    marketDescriptors[pair] = marketDescriptor;
                    if (subscribe) {
                        await this.subscribeTrades(pair);
                        await this.subscribeOrderbook(pair);
                    }
                }
            } catch (err) {
                console.error(err);
                this.stop();
            }
        }
    }

    private onRawTradeData(
        pair: string, rawTrade: RawTrades['data'][0],
    ): void {
        const isContract = pair !== 'BTC/USDT';
        const trade = formatRawTrade(rawTrade, isContract);
        const sentData: PDFATC = { trades: [trade] };
        this.center[pair].send(JSON.stringify(sentData));
    }

    private onRawOrderbookData(
        pair: string, rawOrderbookData: RawOrderbook['data'][0],
    ): void {
        const orderbook = this.rawOrderbookHandler[pair]
            .handle(rawOrderbookData);
        const sentData: PDFATC = { orderbook };
        this.center[pair].send(JSON.stringify(sentData));
    }

    private async subscribeInstruments() {
        const channel = 'futures/instruments';
        this.okex.subscribe(channel);
        const onIdSub = (raw: RawData) => {
            if (
                raw.channel === channel
                && raw.event === 'subscribe'
            ) this.okex.emit('subscribed');
        }
        this.okex.on('rawData', onIdSub);
        await once(this.okex, 'subscribed');
        this.okex.off('rawData', onIdSub);
    }

    private async subscribeTrades(pair?: string): Promise<void> {
        for (const { tradesChannel } of
            pair
                ? [marketDescriptors[pair]]
                : Object.values(marketDescriptors)
        ) {
            this.okex.subscribe(tradesChannel!);
            const onTradesSub = (raw: RawData) => {
                if (
                    raw.channel === tradesChannel
                    && raw.event === 'subscribe'
                ) this.okex.emit('subscribed');
            }
            this.okex.on('rawData', onTradesSub);
            await once(this.okex, 'subscribed');
            this.okex.off('rawData', onTradesSub);
        }
    }

    private async subscribeOrderbook(_pair?: string): Promise<void> {
        for (const pair in
            _pair
                ? { [_pair]: {} }
                : marketDescriptors
        ) {
            const { orderbookChannel } = marketDescriptors[pair];
            const isContract = pair !== 'BTC/USDT';
            this.rawOrderbookHandler[pair]
                = new RawOrderbookHandler(isContract);

            this.okex.subscribe(orderbookChannel!);
            const onOrderbookSub = (raw: RawData) => {
                if (
                    raw.channel === orderbookChannel
                    && raw.event === 'subscribe'
                ) this.okex.emit('subscribed');
            }
            this.okex.on('rawData', onOrderbookSub);
            await once(this.okex, 'subscribed');
            this.okex.off('rawData', onOrderbookSub);
        }
    }
}

export default PublicAgentOkexWebsocket;