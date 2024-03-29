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
const fse = require("fs-extra");
const coroutine_locks_1 = require("coroutine-locks");
const { removeSync } = fse;
const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
assert(XDG_RUNTIME_DIR);
/*
    stop 返回后，可能还有几个处理连接的线程没有结束，直接再次 start 可能导致
    readyState 误判。因此这个 startable 对象不可复用。
*/
class Server extends startable_1.Startable {
    constructor(mid, broadcast) {
        super();
        this.mid = mid;
        this.broadcast = broadcast;
        this.httpServer = http_1.createServer();
        this.koa = new Koa();
        this.router = new Router();
        this.filter = new koa_ws_filter_1.KoaWsFilter();
        this.rwlock = new coroutine_locks_1.Rwlock();
        this.router.all('/', async (ctx, next) => {
            const client = await ctx.upgrade();
            const onTrades = (trades) => {
                const message = JSON.stringify({
                    event: 'trades',
                    data: trades,
                });
                client.send(message);
            };
            const onOrderbook = (orderbook) => {
                const message = JSON.stringify({
                    event: 'orderbook',
                    data: orderbook,
                });
                client.send(message);
            };
            this.broadcast.on(`${mid}/trades`, onTrades);
            this.broadcast.on(`${mid}/orderbook`, onOrderbook);
            client.on('error', console.error);
            client.on('close', () => {
                this.broadcast.off(`${mid}/trades`, onTrades);
                this.broadcast.off(`${mid}/orderbook`, onOrderbook);
            });
            await next();
        });
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
                const message = JSON.stringify(orderbook);
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
        this.koa.use(async (ctx, next) => {
            if (this.readyState === "STARTED" /* STARTED */) {
                await this.rwlock.rlock();
                await next();
                this.rwlock.unlock();
            }
        });
        this.koa.use(this.filter.protocols());
        this.httpServer.on('request', this.koa.callback());
    }
    async _start() {
        const socketFilePath = path_1.join(XDG_RUNTIME_DIR, `${this.mid}.socket`);
        removeSync(socketFilePath);
        this.httpServer.listen(socketFilePath);
        await events_1.once(this.httpServer, 'listening');
    }
    async _stop() {
        this.httpServer.close();
        await this.rwlock.wlock();
        this.rwlock.unlock();
        this.filter.closeAsync().catch(() => { });
        await events_1.once(this.httpServer, 'close');
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map