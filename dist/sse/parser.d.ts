export interface SseEvent {
    event: string;
    data: string;
    id?: string;
}
export interface SseParserHandlers {
    onEvent(event: SseEvent): void;
    onComment?(comment: string): void;
}
export declare class SseParser {
    #private;
    constructor(handlers: SseParserHandlers);
    push(chunk: Uint8Array): void;
    finish(): void;
}
