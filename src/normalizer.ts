import Startable from 'startable';
import RawExtractor from './raw-extractor';
import EventEmitter from 'events';
import {
    RawDataOrderbook,
    RawDataTrades,
    RawUnSub,
    Operation,
    Trade,
    RawTrade,
    Orderbook,
    RawOrderbook,
} from './interfaces';

/*
    'trades' pair trades
    'orderbook' pair orderbook
*/

abstract class Normalizer extends Startable {
    protected abstract normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
    protected abstract pair: string;
    protected abstract rawTradesChannel: string;
    protected abstract rawOrderbookChannel: string;
    protected abstract instrumentId: string;

    constructor(
        private rawExtractor: RawExtractor,
        private broadcast: EventEmitter,
    ) {
        super();
    }

    protected async _start(): Promise<void> {
        this.rawExtractor.on(`trades/${this.instrumentId}`, this._onRawDataTrades);
        this.rawExtractor.on(`orderbook/${this.instrumentId}`, this._onRawDataOrderbook);

        this.unSubscribe('subscribe');
    }

    protected async _stop() {
        this.rawExtractor.off(`trades/${this.instrumentId}`, this._onRawDataTrades);
        this.rawExtractor.off(`orderbook/${this.instrumentId}`, this._onRawDataOrderbook);
    }

    private _onRawDataTrades(
        ...args: Parameters<typeof Normalizer.prototype.onRawDataTrades>
    ): void {
        try {
            this.onRawDataTrades(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private _onRawDataOrderbook(
        ...args: Parameters<typeof Normalizer.prototype.onRawDataOrderbook>
    ): void {
        try {
            this.onRawDataOrderbook(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private onRawDataTrades(rawDataTrades: RawDataTrades): void {
        const trades = rawDataTrades.data
            .map(rawTrade => this.normalizeRawTrade(rawTrade));
        this.broadcast.emit('trades', this.pair, trades);
    }

    private onRawDataOrderbook(rawDataOrderbook: RawDataOrderbook): void {
        const orderbooks = rawDataOrderbook.data
            .map(rawOrderbook => this.normalizeRawOrderbook(rawOrderbook));
        for (const orderbook of orderbooks)
            this.broadcast.emit('orderbook', this.pair, orderbook);
    }

    private async unSubscribe(operation: Operation) {
        await this.rawExtractor.send({
            op: operation,
            args: [
                this.rawTradesChannel,
                this.rawOrderbookChannel,
            ],
        });
        const waitForUnSub = (rawChannel: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                const onUnSub = (rawUnSub: RawUnSub) => {
                    if (rawUnSub.channel === rawChannel) {
                        this.rawExtractor.off(operation, onUnSub);
                        this.rawExtractor.off('error', reject);
                        resolve();
                    }
                }
                this.rawExtractor.on(operation, onUnSub);
                this.rawExtractor.on('error', reject);
            });
        }
        await Promise.all([
            waitForUnSub(this.rawTradesChannel),
            waitForUnSub(this.rawOrderbookChannel),
        ]);
    }
}

export {
    Normalizer as default,
    Normalizer,
};
