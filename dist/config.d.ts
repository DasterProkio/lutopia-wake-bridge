import { type WakeReason } from "./protocol.js";
export interface BridgeTimeouts {
    readonly connectMs: number;
    readonly checkMs: number;
    readonly runtimeDeliveryMs: number;
    readonly runtimeCloseMs: number;
}
export declare const DEFAULT_TIMEOUTS: Readonly<BridgeTimeouts>;
export declare const DEFAULT_LUTOPIA_BASE_URL = "https://lutopia.app";
export type LogLevel = "debug" | "info" | "warn" | "error";
export type WakeMessageMap = Readonly<Record<WakeReason, string>>;
export interface InjectorConfig {
    readonly executable: string | undefined;
    readonly args: readonly string[];
    readonly workingDirectory: string | undefined;
}
export interface BridgeConfig {
    readonly baseUrl: URL;
    readonly machineToken: string;
    readonly wakeMessageMap: WakeMessageMap;
    readonly injector: Readonly<InjectorConfig>;
    readonly logLevel: LogLevel;
    readonly timeouts: Readonly<BridgeTimeouts>;
}
export declare class ConfigError extends Error {
    constructor(message: string);
}
export declare function validateGardenBaseUrl(raw: string | URL): URL;
/** The agent's MCP link (https://lutopia.app/mcp/<code>/sse) carries its credential and the site origin. */
export declare function parseMcpUrl(raw: string): {
    readonly origin: string;
    readonly token: string;
};
export declare function loadConfig(env?: NodeJS.ProcessEnv): BridgeConfig;
