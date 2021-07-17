import { Startable } from 'startable';
import { EventEmitter } from 'events';
import { Stream } from './stream';
import { ExtractorConstructor, Extractor } from './extractor';


export class PublagentOkex extends Startable {
    private broadcast = new EventEmitter();
    private stream = new Stream();
    private extractors: Extractor[];

    constructor(extractorConstructors: ExtractorConstructor[]) {
        super();
        this.stream.on('error', console.error);
        this.extractors = extractorConstructors.map(extractorConstructor =>
            new extractorConstructor(this.stream, this.broadcast));
    }

    protected async _start(): Promise<void> {
        await this.stream.start(this.starp);
        for (const extractor of this.extractors)
            await extractor.start(this.starp);
    }

    protected async _stop(): Promise<void> {
        for (const extractor of this.extractors)
            await extractor.stop();
        await this.stream.stop();
    }
}
