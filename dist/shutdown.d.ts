export declare const SHUTDOWN_SIGNALS: readonly ["SIGINT", "SIGTERM", "SIGBREAK"];
export type ShutdownSignal = (typeof SHUTDOWN_SIGNALS)[number];
export interface SignalSource {
    once(signal: ShutdownSignal, listener: () => void): unknown;
    removeListener(signal: ShutdownSignal, listener: () => void): unknown;
}
export declare function installShutdownHandlers(controller: AbortController, signalSource?: SignalSource): () => void;
