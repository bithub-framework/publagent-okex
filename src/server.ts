import { Startable, ReadyState } from 'startable';
import { EventEmitter, once } from 'events';
import Koa = require('koa');
import Router = require('@koa/router');
import { KoaWsFilter, Upgraded } from 'koa-ws-filter';
import { createServer } from 'http';
import { join } from 'path';
import assert = require('assert');
import fse = require('fs-extra');
import {
    Trade,
    Orderbook,
} from './interfaces';
import { Rwlock } from 'coroutine-locks';
const { removeSync } = fse;
const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
assert(XDG_RUNTIME_DIR);


/*
    stop 返回后，可能还有几个处理连接的线程没有结束，直接再次 start 可能导致
    readyState 误判。因此这个 startable 对象不可复用。
*/
export class Server extends Startable {
    private httpServer = createServer();
    private koa = new Koa();
    private router = new Router<any, Upgraded<{}>>();
    private filter = new KoaWsFilter();
    private rwlock = new Rwlock();

    constructor(
        private mid: string,
        private broadcast: EventEmitter,
    ) {
        super();

        this.router.all('/', async (ctx, next) => {
            const client = await ctx.upgrade();
            const onTrades = (trades: Trade[]): void => {
                const message = JSON.stringify({
                    event: 'trades',
                    data: trades,
                });
                client.send(message);
            }
            const onOrderbook = (orderbook: Orderbook): void => {
                const message = JSON.stringify({
                    event: 'orderbook',
                    data: orderbook,
                });
                client.send(message);
            }
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
            const onData = (trades: Trade[]): void => {
                const message = JSON.stringify(trades);
                client.send(message);
            }
            this.broadcast.on(`${mid}/trades`, onData);
            client.on('error', console.error);
            client.on('close', () => {
                this.broadcast.off(`${mid}/trades`, onData);
            });

            await next();
        });

        this.router.all('/orderbook', async (ctx, next) => {
            const client = await ctx.upgrade();
            const onData = (orderbook: Orderbook): void => {
                const message = JSON.stringify(orderbook);
                client.send(message);
            }
            this.broadcast.on(`${mid}/orderbook`, onData);
            client.on('error', console.error);
            client.on('close', () => {
                this.broadcast.off(`${mid}/orderbook`, onData);
            });

            await next();
        });

        this.filter.ws(this.router.routes());
        this.koa.use(async (ctx, next) => {
            if (this.readyState === ReadyState.STARTED) {
                await this.rwlock.rlock();
                await next();
                this.rwlock.unlock();
            }
        });
        this.koa.use(this.filter.protocols());
        this.httpServer.on('request', this.koa.callback());
    }

    protected async _start() {
        const socketFilePath = join(<string>XDG_RUNTIME_DIR, `${this.mid}.socket`);
        removeSync(socketFilePath);
        this.httpServer.listen(socketFilePath);
        await once(this.httpServer, 'listening');
    }

    protected async _stop() {
        this.httpServer.close();
        await this.rwlock.wlock();
        this.rwlock.unlock();
        this.filter.closeAsync().catch(() => { });
        await once(this.httpServer, 'close');
    }
}
