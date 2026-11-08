import type { LogLevel } from "./config.js";
export interface Logger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
}
export declare function redactText(value: string, secrets?: readonly string[]): string;
export declare function safeErrorMessage(error: unknown, secrets?: readonly string[]): string;
export declare function createLogger(level: LogLevel, options?: {
    secrets?: readonly string[];
    write?: (line: string) => void;
}): Logger;
export declare const silentLogger: Logger;
