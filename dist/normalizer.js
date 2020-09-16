import Startable from 'startable';
/*
    events
        'trades/<pair>' trades
        'orderbook/<pair>' orderbook
*/
class Normalizer extends Startable {
    constructor(deserializer, broadcast) {
        super();
        this.deserializer = deserializer;
        this.broadcast = broadcast;
    }
    async _start() {
        this.deserializer.on(`${"trades" /* TRADES */}/${this.instrumentId}`, this._onRawDataTrades);
        this.deserializer.on(`${"orderbook" /* ORDERBOOK */}/${this.instrumentId}`, this._onRawDataOrderbook);
        await this.unSubscribe("subscribe" /* subscribe */);
    }
    async _stop() {
        this.deserializer.off(`${"trades" /* TRADES */}/${this.instrumentId}`, this._onRawDataTrades);
        this.deserializer.off(`${"orderbook" /* ORDERBOOK */}/${this.instrumentId}`, this._onRawDataOrderbook);
    }
    _onRawDataTrades(...args) {
        try {
            this.onRawDataTrades(...args);
        }
        catch (err) {
            this.stop(err);
        }
    }
    _onRawDataOrderbook(...args) {
        try {
            this.onRawDataOrderbook(...args);
        }
        catch (err) {
            this.stop(err);
        }
    }
    onRawDataTrades(rawDataTrades) {
        const trades = rawDataTrades.data
            .map(rawTrade => this.normalizeRawTrade(rawTrade));
        this.broadcast.emit(`${"trades" /* TRADES */}/${this.pair}`, trades);
    }
    onRawDataOrderbook(rawDataOrderbook) {
        const orderbooks = rawDataOrderbook.data
            .map(rawOrderbook => this.normalizeRawOrderbook(rawOrderbook));
        for (const orderbook of orderbooks)
            this.broadcast.emit(`${"orderbook" /* ORDERBOOK */}/${this.pair}`, orderbook);
    }
    async unSubscribe(operation) {
        await this.deserializer.send({
            op: operation,
            args: [
                this.rawTradesChannel,
                this.rawOrderbookChannel,
            ],
        });
        const waitForUnSub = (rawChannel) => {
            return new Promise((resolve, reject) => {
                const onUnSub = (rawUnSub) => {
                    console.log('on un sub');
                    if (rawUnSub.channel === rawChannel) {
                        console.log('on channel comparison');
                        this.deserializer.off(operation, onUnSub);
                        this.deserializer.off('error', reject);
                        resolve();
                    }
                };
                this.deserializer.on(operation, onUnSub);
                this.deserializer.on('error', err => {
                    console.error('sub error');
                    reject();
                });
            });
        };
        await Promise.all([
            waitForUnSub(this.rawTradesChannel),
            waitForUnSub(this.rawOrderbookChannel),
        ]);
    }
}
export { Normalizer as default, Normalizer, };
//# sourceMappingURL=normalizer.js.map