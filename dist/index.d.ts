declare class QAOW {
    private stopping;
    private okex;
    private center;
    private subscriberTrade;
    private subscriberDepth;
    private state;
    constructor(stopping?: (err?: Error) => void);
    private started;
    start(): Promise<void>;
    _start(): Promise<void>;
    private stopped;
    stop(err?: Error): Promise<void>;
    private _stop;
    private connectQuoteCenter;
    private connectOkex;
}
export default QAOW;
