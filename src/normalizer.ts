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
} from './interfaces';
import config from './config';

/*
    events
        '<marketName>/<pair>/trades' trades
        '<marketName>/<pair>/orderbook' orderbook
*/

abstract class Normalizer extends Startable {
    // TS 暂不支持 static abstract 成员
    protected abstract normalizeRawTrade(rawTrade: RawTrade): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbook): Orderbook;
    protected abstract pair: string;
    protected abstract rawTradesChannel: string;
    protected abstract rawOrderbookChannel: string;
    protected abstract rawInstrumentId: string;

    constructor(
        private deserializer: Deserializer,
        private broadcast: EventEmitter,
    ) {
        super();
    }

    protected async _start(): Promise<void> {
        this.deserializer.on(
            `trades/${this.rawInstrumentId}`,
            this._onRawTrades,
        );
        this.deserializer.on(
            `orderbook/${this.rawInstrumentId}`,
            this._onRawOrderbook,
        );
        await this.unSubscribe('subscribe');
    }

    protected async _stop() {
        this.deserializer.off(
            `trades/${this.rawInstrumentId}`,
            this._onRawTrades,
        );
        this.deserializer.off(
            `orderbook/${this.rawInstrumentId}`,
            this._onRawOrderbook,
        );
    }

    private _onRawTrades = (
        ...args: Parameters<typeof Normalizer.prototype.onRawTrades>
    ): void => {
        try {
            this.onRawTrades(...args);
        } catch (err) {
            this.stop(err);
        }
    }

    private _onRawOrderbook = (
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
        this.broadcast.emit(`${config.MARKET_NAME}/${this.pair}/trades`, trades);
    }

    private onRawOrderbook(rawOrderbook: RawOrderbook): void {
        const orderbook = this.normalizeRawOrderbook(rawOrderbook);
        this.broadcast.emit(`${config.MARKET_NAME}/${this.pair}/orderbook`, orderbook);
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
