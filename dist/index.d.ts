declare class QAOW {
    private stopping;
    private okex;
    private center;
    private subscriberTrade;
    private subscriberDepth;
    private state;
    constructor(stopping?: (err?: Error) => void);
    start(): Promise<void>;
    stop(err?: Error): void;
    private connectQuoteCenter;
    private connectOkex;
}
export default QAOW;
