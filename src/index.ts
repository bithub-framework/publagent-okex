import V3WebsocketClient from './official-v3-websocket-client';
import fEvent from 'first-event';
import WebSocket from 'ws';
import fse from 'fs-extra';
import path from 'path';
import { boundMethod } from 'autobind-decorator';
import assert from 'assert';
import { flow as pipe } from 'lodash';
import { Trade, Orderbook, QuoteDataFromAgentToCenter as QDFATC } from 'interfaces';
import SubscriberTrade from './subscriber-trade';
import SubscriberDepth from './subscriber-depth';
import logger from './logger';

const config: {
    QUOTE_CENTER_PORT: number,
} = fse.readJsonSync(path.join(__dirname, '../cfg/config.json'));

enum States {
    READY,
    STARTING,
    RUNNING,
    STOPPING,
};

class QAOW {
    private okex: V3WebsocketClient | undefined;
    private center: WebSocket | undefined;
    private subscriberTrade: SubscriberTrade | undefined;
    private subscriberDepth: SubscriberDepth | undefined;
    private state = States.READY;
    private started: Promise<void> | undefined;
    private stopped: Promise<void> | undefined;

    constructor(private stopping: (err?: Error) => void = () => { }) { }

    start(): Promise<void> {
        this.started = (async () => {
            assert(this.state === States.READY);
            this.state = States.STARTING;

            await this.connectOkex();
            await this.connectQuoteCenter();

            this.okex!.on('message', msg =>
                void this.okex!.emit('data', JSON.parse(msg)));

            this.subscriberTrade = new SubscriberTrade(this.okex!);
            this.subscriberTrade.on('data', pipe(
                (trades: Trade[]): QDFATC => ({
                    exchange: 'okex',
                    pair: ['btc', 'usdt'],
                    trades,
                }),
                JSON.stringify,
                this.center!.send.bind(this.center!),
            ));
            this.subscriberTrade.on('error', logger.error);
            this.subscriberTrade.on(
                SubscriberTrade.States.DESTRUCTING.toString(),
                this.stop,
            );

            this.subscriberDepth = new SubscriberDepth(this.okex!);
            this.subscriberDepth.on('data', pipe(
                (orderbook: Orderbook): QDFATC => ({
                    exchange: 'okex',
                    pair: ['btc', 'usdt'],
                    orderbook,
                }),
                JSON.stringify,
                this.center!.send.bind(this.center!),
            ));
            this.subscriberDepth.on('error', logger.error);
            this.subscriberDepth.on(
                SubscriberDepth.States.DESTRUCTING.toString(),
                this.stop,
            );

            this.state = States.RUNNING;
        })().catch(err => {
            this.stop();
            throw err;
        });
        return this.started;
    }

    @boundMethod
    stop(err?: Error): Promise<void> {
        if (this.state === States.STOPPING)
            return this.stopped!;
        if (this.state === States.STARTING)
            return this.started!
                .then(() => void this.stop())
                .catch(() => void this.stop());

        this.state = States.STOPPING;
        this.stopped = (async () => {
            this.stopping(err);
            this.okex!.close();
            this.center!.close();

            this.state = States.READY;
        })();
        return this.stopped;
    }

    private async connectQuoteCenter(): Promise<void> {
        this.center = new WebSocket(`ws://localhost:${config.QUOTE_CENTER_PORT}`);
        await fEvent([{
            emitter: this.center, event: 'open',
        }, {
            emitter: this.center, event: 'error',
        }]).then(({ event, args }) => {
            if (event === 'error') throw args[0];
        });
    }

    private async connectOkex(): Promise<void> {
        this.okex = new V3WebsocketClient();
        this.okex!.connect();
        await fEvent([{
            emitter: this.okex!, event: 'open',
        }, {
            emitter: this.okex!, event: 'error',
        }]).then(({ event, args }) => {
            if (event === 'error') throw args[0];
        });
    }
}

export default QAOW;