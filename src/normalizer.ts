import Startable from 'startable';
import Deserializer from './deserializer';
import EventEmitter from 'events';
import {
    RawUnSub,
    Operation,
    Trade,
    RawTrade,
    Orderbook,
    RawOrderbook,
    Channel,
} from './interfaces';
import config from './config';

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
        ...args: Parameters<typeof Normalizer.prototype.onRawTrades>
    ): void => {
        try {
            this.onRawTrades(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private _onRawDataOrderbook = (
        ...args: Parameters<typeof Normalizer.prototype.onRawOrderbook>
    ): void => {
        try {
            this.onRawOrderbook(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private onRawTrades(rawTrades: RawTrade[]): void {
        const trades = rawTrades
            .map(rawTrade => this.normalizeRawTrade(rawTrade));
        this.broadcast.emit(`${config.MARKET_NAME}/${this.pair}/${Channel.TRADES}`, trades);
    }

    private onRawOrderbook(rawOrderbook: RawOrderbook): void {
        const orderbook = this.normalizeRawOrderbook(rawOrderbook);
        this.broadcast.emit(`${config.MARKET_NAME}/${this.pair}/${Channel.ORDERBOOK}`, orderbook);
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
                        this.deserializer.off(`${operation}/${rawChannel}`, onUnSub);
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
