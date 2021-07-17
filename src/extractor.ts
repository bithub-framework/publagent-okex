import { Startable } from 'startable';
import { Stream } from './stream';
import { EventEmitter } from 'events';
import { Server } from './server';
import assert = require('assert');
import { kebabCase } from 'identifier-cases';
import {
    Trade,
    Orderbook,
    RawOrderbookMessage,
    isRawOrderbookMessage,
    RawTradesMessage,
    isRawTradesMessage,
    isRawError,
    isRawUnSubscription,
    SubscriptionOperation,
    RawChannel,
} from './interfaces';


export interface ExtractorConstructor {
    new(stream: Stream, broadcast: EventEmitter): Extractor;
}

export abstract class Extractor extends Startable {
    // TS 暂不支持 static abstract 成员
    protected abstract normalizeRawTrade(rawTrade: RawTradesMessage['data'][0]): Trade;
    protected abstract normalizeRawOrderbook(rawOrderbook: RawOrderbookMessage['data'][0]): Orderbook;
    protected abstract mid: string;
    protected abstract rawInstrumentId: string;
    private server?: Server;

    constructor(
        private stream: Stream,
        private broadcast: EventEmitter,
    ) {
        super();

        this.stream.on('message', (message: any) => {
            try {
                if (isRawTradesMessage(message, this.rawInstrumentId)) {
                    const trades = message.data
                        .map(rawTrade => this.normalizeRawTrade(rawTrade));
                    this.broadcast.emit(`${this.mid}/trades`, trades);
                }
                if (isRawOrderbookMessage(message, this.rawInstrumentId)) {
                    const latest = message.data[message.data.length - 1];
                    const orderbook = this.normalizeRawOrderbook(latest);
                    this.broadcast.emit(`${this.mid}/orderbook`, orderbook);
                }
            } catch (err) {
                this.stop(err).catch(() => { });
            }
        });
    }

    protected async _start(): Promise<void> {
        assert(kebabCase.test(this.mid));
        this.server = new Server(this.mid, this.broadcast);
        await this.subscriptionOperate('subscribe', 'trades')
        await this.subscriptionOperate('subscribe', 'books5');
        await this.server.start(this.starp);
    }

    protected async _stop() {
        if (this.server) await this.server.stop();
        await this.subscriptionOperate('unsubscribe', 'trades');
        await this.subscriptionOperate('unsubscribe', 'books5');
    }

    private async subscriptionOperate(
        operation: SubscriptionOperation,
        rawChannel: RawChannel,
    ) {
        await this.stream.send({
            op: operation,
            args: [{
                channel: rawChannel,
                instId: this.rawInstrumentId,
            }],
        });
        await new Promise<void>((resolve, reject) => {
            const onMessage = (message: any) => {
                if (isRawUnSubscription(
                    message,
                    operation,
                    this.rawInstrumentId,
                    rawChannel,
                )) {
                    this.stream.off('message', onMessage);
                    resolve();
                }
                if (isRawError(message)) {
                    this.stream.off('message', onMessage);
                    reject(new Error(message.msg));
                }
            }
            this.stream.on('message', onMessage);
        });
    }
}
