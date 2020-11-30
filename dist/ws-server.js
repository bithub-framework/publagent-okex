import Startable from 'startable';
import { once } from 'events';
import Koa from 'koa';
import Router from 'koa-router';
import _ from 'lodash';
import WsFilter from 'koa-ws-filter';
import http from 'http';
import fetch from 'node-fetch';
import config from './config';
const ACTIVE_CLOSE = 'public agent okex websocket';
class WsServer extends Startable {
    constructor(broadcast) {
        super();
        this.broadcast = broadcast;
        this.httpServer = http.createServer();
        this.koa = new Koa();
        this.router = new Router();
        this.wsFilter = new WsFilter();
        this.router.all('/:exchange/:instrument/:currency/:suffix*', async (ctx, next) => {
            ctx.state.marketName = _.toLower(`${ctx.params.exchange}/${ctx.params.instrument}/${ctx.params.currency}`);
            await next();
        });
        this.router.all('/:exchange/:instrument/:currency/trades', async (ctx, next) => {
            const { marketName } = ctx.state;
            const client = await ctx.state.upgrade();
            function onData(trades) {
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
            const client = await ctx.state.upgrade();
            function onData(orderbook) {
                const orderbookDepthLtd = {
                    bids: orderbook.bids.slice(0, ctx.query.depth),
                    asks: orderbook.asks.slice(0, ctx.query.depth),
                    time: orderbook.time,
                };
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
        this.koa.use(this.wsFilter.filter());
        this.httpServer.on('request', this.koa.callback());
    }
    async _start() {
        this.httpServer.listen();
        await once(this.httpServer, 'listening');
        const port = this.httpServer.address().port;
        await fetch('http://localhost:12000/public-agents-okex-websocket', {
            method: 'put',
            body: `http://localhost:${port}`,
        });
    }
    async _stop() {
        this.httpServer.close();
        await Promise.all([
            this.wsFilter.close(config.WS_CLOSE_TIMEOUT, ACTIVE_CLOSE),
            once(this.httpServer, 'close'),
        ]);
    }
}
export { WsServer as default, WsServer, };
//# sourceMappingURL=ws-server.js.map