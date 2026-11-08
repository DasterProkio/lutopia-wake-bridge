import type { Logger } from "../logging.js";
import { type GardenProtocolEvent, type ProtocolDiagnostic } from "../protocol.js";
export type GardenStreamErrorKind = "auth" | "terminal";
export declare class GardenStreamError extends Error {
    readonly kind: GardenStreamErrorKind;
    readonly status: number | undefined;
    constructor(kind: GardenStreamErrorKind, message: string, status?: number);
}
export interface GardenSseClientOptions {
    baseUrl: URL;
    machineToken: string;
    connectTimeoutMs: number;
    logger: Logger;
    fetch?: typeof globalThis.fetch;
}
export interface StreamAttemptResult {
    connected: boolean;
    stopped: boolean;
}
export interface StreamAttemptHandlers {
    onEvent(event: Exclude<GardenProtocolEvent, {
        kind: "ignored";
    }>): boolean | void;
    onIgnored?(diagnostic: ProtocolDiagnostic<"debug" | "warn">): void;
}
export declare class GardenSseClient {
    #private;
    constructor(options: GardenSseClientOptions);
    streamOnce(handlers: StreamAttemptHandlers, signal: AbortSignal): Promise<StreamAttemptResult>;
    probe(signal: AbortSignal): Promise<void>;
}
