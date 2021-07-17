import { Startable } from 'startable';
import { EventEmitter, once } from 'events';
import Koa = require('koa');
import Router = require('@koa/router');
import { KoaWsFilter, Upgraded } from 'koa-ws-filter';
import { createServer } from 'http';
import { join } from 'path';
import assert = require('assert');
import {
    Trade,
    Orderbook,
    Side,
} from './interfaces';
const XDG_RUNTIME_DIR = process.env['XDG_RUNTIME_DIR'];
assert(XDG_RUNTIME_DIR);


export class Server extends Startable {
    private httpServer = createServer();
    private koa = new Koa();
    private router = new Router<any, Upgraded<{}>>();
    private filter = new KoaWsFilter();

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
                const shallowBook: Orderbook = {
                    [Side.BID]: orderbook[Side.BID].slice(0, ctx.query.depth),
                    [Side.ASK]: orderbook[Side.ASK].slice(0, ctx.query.depth),
                    time: orderbook.time,
                }
                const message = JSON.stringify({
                    event: 'orderbook',
                    data: shallowBook,
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
                const shallowBook: Orderbook = {
                    [Side.BID]: orderbook[Side.BID].slice(0, ctx.query.depth),
                    [Side.ASK]: orderbook[Side.ASK].slice(0, ctx.query.depth),
                    time: orderbook.time,
                }
                const message = JSON.stringify(shallowBook);
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
        this.koa.use(this.filter.protocols());
        this.httpServer.on('request', this.koa.callback());
    }

    protected async _start() {
        const socketFilePath = join(<string>XDG_RUNTIME_DIR, `${this.mid}.socket`);
        this.httpServer.listen(socketFilePath);
        await once(this.httpServer, 'listening');
    }

    protected async _stop() {
        this.httpServer.close();
        this.filter.closeAsync().catch(() => { });
        await once(this.httpServer, 'close');
    }
}
