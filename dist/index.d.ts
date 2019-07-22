declare class QAOW {
    private stopping;
    private okex;
    private center;
    private subscriberTrade;
    private subscriberDepth;
    private state;
    private started;
    private stopped;
    constructor(stopping?: (err?: Error) => void);
    start(): Promise<void>;
    stop(err?: Error): Promise<void>;
    private connectQuoteCenter;
    private connectOkex;
}
export default QAOW;
