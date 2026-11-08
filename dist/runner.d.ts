import type { BridgeConfig } from "./config.js";
import type { Logger } from "./logging.js";
import type { RuntimeAdapter } from "./runtime/adapter.js";
import { type StreamAttemptHandlers, type StreamAttemptResult } from "./sse/client.js";
export interface GardenEventStream {
    streamOnce(handlers: StreamAttemptHandlers, signal: AbortSignal): Promise<StreamAttemptResult>;
}
export interface BridgeRunnerDependencies {
    createClient?: () => GardenEventStream;
}
export declare function runBridge(config: BridgeConfig, adapter: RuntimeAdapter, logger: Logger, signal: AbortSignal, dependencies?: BridgeRunnerDependencies): Promise<void>;
