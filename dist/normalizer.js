import Startable from 'startable';
/*
    'trades' pair trades
    'orderbook' pair orderbook
*/
class Normalizer extends Startable {
    constructor(rawExtractor, broadcast) {
        super();
        this.rawExtractor = rawExtractor;
        this.broadcast = broadcast;
    }
    async _start() {
        this.rawExtractor.on(`trades/${this.instrumentId}`, this._onRawDataTrades);
        this.rawExtractor.on(`orderbook/${this.instrumentId}`, this._onRawDataOrderbook);
        this.unSubscribe('subscribe');
    }
    async _stop() {
        this.rawExtractor.off(`trades/${this.instrumentId}`, this._onRawDataTrades);
        this.rawExtractor.off(`orderbook/${this.instrumentId}`, this._onRawDataOrderbook);
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
        this.broadcast.emit('trades', this.pair, trades);
    }
    onRawDataOrderbook(rawDataOrderbook) {
        const orderbooks = rawDataOrderbook.data
            .map(rawOrderbook => this.normalizeRawOrderbook(rawOrderbook));
        for (const orderbook of orderbooks)
            this.broadcast.emit('orderbook', this.pair, orderbook);
    }
    async unSubscribe(operation) {
        await this.rawExtractor.send({
            op: operation,
            args: [
                this.rawTradesChannel,
                this.rawOrderbookChannel,
            ],
        });
        const waitForUnSub = (rawChannel) => {
            return new Promise((resolve, reject) => {
                const onUnSub = (rawUnSub) => {
                    if (rawUnSub.channel === rawChannel) {
                        this.rawExtractor.off(operation, onUnSub);
                        this.rawExtractor.off('error', reject);
                        resolve();
                    }
                };
                this.rawExtractor.on(operation, onUnSub);
                this.rawExtractor.on('error', reject);
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