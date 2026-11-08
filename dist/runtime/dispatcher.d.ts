import type { Logger } from "../logging.js";
import type { RuntimeWake } from "../protocol.js";
import type { RuntimeAdapter } from "./adapter.js";
export interface WakeDispatcherOptions {
    maxAttempts: number;
    retryDelayMs: number;
    deliveryTimeoutMs: number;
    closeTimeoutMs: number;
}
type PendingWake = RuntimeWake;
export declare class WakeDispatcher {
    #private;
    constructor(adapter: RuntimeAdapter, logger: Logger, options?: Partial<WakeDispatcherOptions>);
    enqueue(input: PendingWake): void;
    idle(): Promise<void>;
    close(): Promise<void>;
}
export {};
