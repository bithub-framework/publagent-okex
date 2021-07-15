"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const startable_1 = require("startable");
const events_1 = require("events");
const Koa = require("koa");
const Router = require("@koa/router");
const koa_ws_filter_1 = require("koa-ws-filter");
const http_1 = require("http");
const path_1 = require("path");
const assert = require("assert");
const interfaces_1 = require("./interfaces");
const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
assert(XDG_RUNTIME_DIR);
class Server extends startable_1.Startable {
    constructor(mid, broadcast) {
        super();
        this.mid = mid;
        this.broadcast = broadcast;
        this.httpServer = http_1.createServer();
        this.koa = new Koa();
        this.router = new Router();
        this.filter = new koa_ws_filter_1.KoaWsFilter();
        this.router.all('/trades', async (ctx, next) => {
            const client = await ctx.upgrade();
            const onData = (trades) => {
                const message = JSON.stringify(trades);
                client.send(message);
            };
            this.broadcast.on(`${mid}/trades`, onData);
            client.on('error', console.error);
            client.on('close', () => {
                this.broadcast.off(`${mid}/trades`, onData);
            });
            await next();
        });
        this.router.all('/orderbook', async (ctx, next) => {
            const client = await ctx.upgrade();
            const onData = (orderbook) => {
                const shallowBook = {
                    [interfaces_1.Side.BID]: orderbook[interfaces_1.Side.BID].slice(0, ctx.query.depth),
                    [interfaces_1.Side.ASK]: orderbook[interfaces_1.Side.ASK].slice(0, ctx.query.depth),
                    time: orderbook.time,
                };
                const message = JSON.stringify(shallowBook);
                client.send(message);
            };
            this.broadcast.on(`${mid}/orderbook`, onData);
            client.on('error', console.error);
            client.on('close', () => {
                this.broadcast.off(`${mid}/orderbook`, onData);
            });
            await next();
        });
        this.filter.ws(this.router.routes());
        this.koa.use(this.filter.protocols());
        this.httpServer.on('request', this.koa.callback());
    }
    async _start() {
        const socketFilePath = path_1.join(XDG_RUNTIME_DIR, `${this.mid}.socket`);
        this.httpServer.listen(socketFilePath);
        await events_1.once(this.httpServer, 'listening');
    }
    async _stop() {
        this.httpServer.close();
        this.filter.closeAsync().catch(() => { });
        await events_1.once(this.httpServer, 'close');
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map