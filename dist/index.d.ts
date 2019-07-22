declare class QAOW {
    private stopping;
    private okex;
    private center;
    private incremental;
    private state;
    constructor(stopping?: (err?: Error) => void);
    start(): Promise<void>;
    stop(err?: Error): void;
    private onMessage;
    private subscribeTrade;
    private subscribeDepth;
    private connectQuoteCenter;
    private connectOkex;
    private normalize;
    private updateOrders;
}
export default QAOW;
