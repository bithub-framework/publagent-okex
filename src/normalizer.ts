import Startable from 'startable';
import Deserializer from './deserializer';
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
    Channel,
} from './interfaces';

/*
    events
        'trades/<pair>' trades
        'orderbook/<pair>' orderbook
*/

abstract class Normalizer extends Startable {
    protected abstract normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
    protected abstract pair: string;
    protected abstract rawTradesChannel: string;
    protected abstract rawOrderbookChannel: string;
    protected abstract instrumentId: string;

    constructor(
        private deserializer: Deserializer,
        private broadcast: EventEmitter,
    ) {
        super();
    }

    protected async _start(): Promise<void> {
        this.deserializer.on(`${Channel.TRADES}/${this.instrumentId}`, this._onRawDataTrades);
        this.deserializer.on(`${Channel.ORDERBOOK}/${this.instrumentId}`, this._onRawDataOrderbook);
        await this.unSubscribe(Operation.subscribe);
    }

    protected async _stop() {
        this.deserializer.off(`${Channel.TRADES}/${this.instrumentId}`, this._onRawDataTrades);
        this.deserializer.off(`${Channel.ORDERBOOK}/${this.instrumentId}`, this._onRawDataOrderbook);
    }

    private _onRawDataTrades = (
        ...args: Parameters<typeof Normalizer.prototype.onRawDataTrades>
    ): void => {
        try {
            this.onRawDataTrades(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private _onRawDataOrderbook = (
        ...args: Parameters<typeof Normalizer.prototype.onRawDataOrderbook>
    ): void => {
        try {
            this.onRawDataOrderbook(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private onRawDataTrades(rawDataTrades: RawDataTrades): void {
        const trades = rawDataTrades.data
            .map(rawTrade => this.normalizeRawTrade(rawTrade));
        this.broadcast.emit(`${Channel.TRADES}/${this.pair}`, trades);
    }

    private onRawDataOrderbook(rawDataOrderbook: RawDataOrderbook): void {
        const orderbooks = rawDataOrderbook.data
            .map(rawOrderbook => this.normalizeRawOrderbook(rawOrderbook));
        for (const orderbook of orderbooks)
            this.broadcast.emit(`${Channel.ORDERBOOK}/${this.pair}`, orderbook);
    }

    private async unSubscribe(operation: Operation) {
        await this.deserializer.send({
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
                        this.deserializer.off(operation, onUnSub);
                        this.deserializer.off('error', reject);
                        resolve();
                    }
                }
                this.deserializer.on(`${operation}/${rawChannel}`, onUnSub);
                this.deserializer.on('error', reject);
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
