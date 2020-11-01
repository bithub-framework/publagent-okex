import Startable from 'startable';
import { EventEmitter, once } from 'events';
import Koa from 'koa';
import Router from 'koa-router';
import _ from 'lodash';
import WsFilter from 'koa-ws-filter';
import WebSocket from 'ws';
import http from 'http';
import config from './config';
import {
    Trade,
    Orderbook,
} from './interfaces';

const ACTIVE_CLOSE = 'public agent okex websocket';

class WsServer extends Startable {
    private httpServer = http.createServer();
    private koa = new Koa();
    private router = new Router();
    private wsFilter = new WsFilter();

    constructor(
        private broadcast: EventEmitter,
    ) {
        super();

        this.router.all('/:exchange/:instrument/:currency/:suffix*', async (
            ctx: Router.RouterContext, next: () => Promise<unknown>,
        ) => {
            ctx.state.marketName = _.toLower(
                `${ctx.params.exchange
                }/${ctx.params.instrument
                }/${ctx.params.currency}`);
            await next();
        });

        this.router.all('/:exchange/:instrument/:currency/trades', async (ctx, next) => {
            const { marketName } = ctx.state;
            const client = <WebSocket>await ctx.state.upgrade();

            function onData(trades: Trade[]): void {
                const message = JSON.stringify(trades);
                client.send(message);
            }
            this.broadcast.on(`${marketName}/trades`, onData);
            client.on('error', console.error);

            client.on('close', () => {
                this.broadcast.off(`${marketName}/trades`, onData);
            });
        });

        this.router.all('/:exchange/:instrument/:currency/orderbook', async (ctx, next) => {
            const { marketName } = ctx.state;
            const client = <WebSocket>await ctx.state.upgrade();

            function onData(orderbook: Orderbook): void {
                const orderbookDepthLtd: Orderbook = {
                    bids: orderbook.bids.slice(0, ctx.query.depth),
                    asks: orderbook.asks.slice(0, ctx.query.depth),
                    time: orderbook.time,
                }
                const message = JSON.stringify(orderbookDepthLtd);
                client.send(message);
            }
            this.broadcast.on(`${marketName}/orderbook`, onData);
            client.on('error', console.error);

            client.on('close', () => {
                this.broadcast.off(`${marketName}/orderbook`, onData);
            });
        });

        this.wsFilter.ws(this.router.routes());
        this.koa.use(this.wsFilter.filter());
        this.httpServer.on('request', this.koa.callback());
    }

    protected async _start() {
        this.httpServer.listen(config.PORT);
        await once(this.httpServer, 'listening');
    }

    protected async _stop() {
        this.httpServer.close();
        await Promise.all([
            this.wsFilter.close(config.WS_CLOSE_TIMEOUT, ACTIVE_CLOSE),
            once(this.httpServer, 'close'),
        ]);
    }
}

export {
    WsServer as default,
    WsServer,
}
