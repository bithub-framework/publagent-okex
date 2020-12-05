import Startable from 'startable';
import Deserializer from './deserializer';
import { EventEmitter } from 'events';
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
            this.onRawTrades,
        );
        this.deserializer.on(
            `orderbook/${this.rawInstrumentId}`,
            this.onRawOrderbook,
        );
        await this.unSubscribe('subscribe');
    }

    protected async _stop() {
        this.deserializer.off(
            `trades/${this.rawInstrumentId}`,
            this.onRawTrades,
        );
        this.deserializer.off(
            `orderbook/${this.rawInstrumentId}`,
            this.onRawOrderbook,
        );
    }

    private onRawTrades = (rawTrades: RawTrade[]): void => {
        try {
            const trades = rawTrades
                .map(rawTrade => this.normalizeRawTrade(rawTrade));
            this.broadcast.emit(`${config.EXCHANGE_NAME}/${this.pair}/trades`, trades);
        } catch (err) {
            this.stop(err).catch(() => { });
        }
    }

    private onRawOrderbook = (rawOrderbook: RawOrderbook): void => {
        try {
            const orderbook = this.normalizeRawOrderbook(rawOrderbook);
            this.broadcast.emit(`${config.EXCHANGE_NAME}/${this.pair}/orderbook`, orderbook);
        } catch (err) {
            this.stop(err).catch(() => { });
        }
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
