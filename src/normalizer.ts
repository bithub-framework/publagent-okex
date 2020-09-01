import Startable from 'startable';
import RawExtractor from './raw-extractor';
import RawOrderbookHandler from './raw-orderbook-handler';
import RawTradesHandler from './raw-trades-handler';
import {
    RawOrderbook,
    RawTrades,
    RawUnSub,
    RawData,
} from './interfaces';
import {
    getChannel,
    getPair,
} from './market-descriptions';

/*
    'trades' pair trades
    'orderbook' pair orderbook
*/

class Normalizer extends Startable {
    private extractor: RawExtractor;
    private rawOrderbookHandler: {
        [pair: string]: RawOrderbookHandler;
    } = {};
    private rawTradesHandler: {
        [pair: string]: RawTradesHandler;
    } = {};

    constructor(url: string) {
        super();
        this.extractor = new RawExtractor(url);
    }

    protected async _start(): Promise<void> {
        this.extractor.on('error', console.error);
        await this.extractor.start(err => {
            if (err) this.stop(err);
        });
        this.extractor.on('data', (raw: RawData) => {
            try {
                this.onRawData(raw);
            } catch (err) {
                this.stop(err);
            }
        });
    }

    protected async _stop(): Promise<void> {
        await this.extractor.stop();
    }

    private onRawData(raw: RawData): void {
        const { table } = raw;
        const channel = getChannel(table);
        if (channel === 'trades') {
            for (const rawTrade of (<RawTrades>raw).data) {
                const { instrument_id } = rawTrade;
                const pair = getPair(table, instrument_id);
                this.emit('trades', pair,
                    this.rawTradesHandler[pair].handle([rawTrade]),
                );
            }
        }
        if (channel === 'orderbook') {
            for (const rawOrderbookData of (<RawOrderbook>raw).data) {
                const { instrument_id } = rawOrderbookData;
                const pair = getPair(table, instrument_id);
                this.emit('orderbook', pair,
                    this.rawOrderbookHandler[pair].handle(rawOrderbookData),
                );
            }
        }
    }

    public async unSubscribe(
        operation: 'subscribe' | 'unsubscribe',
        channel: string,
    ) {
        await this.extractor.send({ op: operation, args: [channel] });
        await new Promise((resolve, reject) => {
            const onUnSub = (raw: RawUnSub) => {
                if (
                    raw.event === operation &&
                    raw.channel === channel
                ) {
                    this.off('(un)sub', onUnSub);
                    this.off('error', reject);
                    resolve();
                }
            }
            this.extractor.on('(un)sub', onUnSub);
            this.extractor.on('error', reject);
        });
    }
}

export {
    Normalizer as default,
    Normalizer,
};