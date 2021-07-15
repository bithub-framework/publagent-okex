import { Startable } from 'startable';
import { EventEmitter } from 'events';
import { Stream } from './stream';
import { ExtractorConstructor, ExtractorLike } from './extractor';
import { Server } from './server';


export class PublagentOkex extends Startable {
    private broadcast = new EventEmitter();
    private stream = new Stream();
    private extractors: ExtractorLike[];
    private servers: Server[];

    constructor(extractorConstructors: ExtractorConstructor[]) {
        super();
        this.stream.on('error', console.error);
        this.extractors = extractorConstructors.map(extractorConstructor =>
            new extractorConstructor(this.stream, this.broadcast));
        this.servers = this.extractors.map(extractor =>
            new Server(extractor.mid, this.broadcast));
    }

    protected async _start(): Promise<void> {
        await this.stream.start(this.starp);
        for (const extractor of this.extractors)
            await extractor.start(this.starp);
        for (const server of this.servers)
            await server.start(this.starp);
    }

    protected async _stop(): Promise<void> {
        for (const server of this.servers)
            await server.stop();
        for (const extractor of this.extractors)
            await extractor.stop();
        await this.stream.stop();
    }
}
