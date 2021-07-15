import { Startable } from 'startable';
import { ExtractorConstructor } from './extractor';
export declare class PublagentOkex extends Startable {
    private broadcast;
    private stream;
    private extractors;
    private servers;
    constructor(extractorConstructors: ExtractorConstructor[]);
    protected _start(): Promise<void>;
    protected _stop(): Promise<void>;
}
