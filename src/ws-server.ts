import Startable from 'startable';
import { EventEmitter, once } from 'events';
import Koa from 'koa';
import Router from '@koa/router';
import _ from 'lodash';
import WsFilter from 'koa-ws-filter';
import WebSocket from 'ws';
import http from 'http';
import { AddressInfo } from 'net';
import fetch from 'node-fetch';
import {
    Trade,
    Orderbook,
    Side,
} from './interfaces';

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

            await next();
        });

        this.router.all('/:exchange/:instrument/:currency/orderbook', async (ctx, next) => {
            const { marketName } = ctx.state;
            const client = <WebSocket>await ctx.state.upgrade();

            function onData(orderbook: Orderbook): void {
                const orderbookDepthLtd: Orderbook = {
                    [Side.BID]: orderbook[Side.BID].slice(0, ctx.query.depth),
                    [Side.ASK]: orderbook[Side.ASK].slice(0, ctx.query.depth),
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

            await next();
        });

        this.wsFilter.ws(this.router.routes());
        this.koa.use(this.wsFilter.protocols());
        this.httpServer.on('request', this.koa.callback());
    }

    protected async _start() {
        this.httpServer.listen();
        await once(this.httpServer, 'listening');
        const port = (<AddressInfo>this.httpServer.address()).port;
        await fetch('http://localhost:12000/public-agent-okex-websocket', {
            method: 'put',
            body: `http://localhost:${port}`,
        });
    }

    protected async _stop() {
        this.httpServer.close();
        await Promise.all([
            this.wsFilter.close(),
            once(this.httpServer, 'close'),
        ]);
    }
}

export {
    WsServer as default,
    WsServer,
}
