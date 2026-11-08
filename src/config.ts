import {
  isWakeReason,
  MAX_WAKE_MESSAGE_LENGTH,
  MAX_WAKE_REASON_LENGTH,
  type WakeReason,
} from "./protocol.js";
import { isAbsolute } from "node:path";

export interface BridgeTimeouts {
  readonly connectMs: number;
  readonly checkMs: number;
  readonly runtimeDeliveryMs: number;
  readonly runtimeCloseMs: number;
}

export const DEFAULT_TIMEOUTS: Readonly<BridgeTimeouts> = Object.freeze({
  connectMs: 10_000,
  checkMs: 10_000,
  runtimeDeliveryMs: 15 * 60_000,
  runtimeCloseMs: 10_000,
});

export const DEFAULT_LUTOPIA_BASE_URL = "https://lutopia.app";

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

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function validateGardenBaseUrl(raw: string | URL): URL {
  let url: URL;
  try {
    url = new URL(raw.toString());
  } catch {
    throw new ConfigError("LUTOPIA_BASE_URL must be a valid URL");
  }

  if (url.username || url.password) {
    throw new ConfigError("LUTOPIA_BASE_URL must not contain credentials");
  }
  if (url.search || url.hash) {
    throw new ConfigError("LUTOPIA_BASE_URL must not contain a query or fragment");
  }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocalHostname(url.hostname))) {
    throw new ConfigError("LUTOPIA_BASE_URL must use HTTPS unless it points to localhost");
  }
  return url;
}

function parseLogLevel(raw: string | undefined): LogLevel {
  const value = raw?.trim() || "info";
  if (value === "debug" || value === "info" || value === "warn" || value === "error") {
    return value;
  }
  throw new ConfigError("LUTOPIA_LOG_LEVEL must be debug, info, warn, or error");
}

function parseWakeMessageMap(raw: string | undefined): WakeMessageMap {
  if (!raw?.trim()) {
    return Object.freeze({});
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ConfigError("LUTOPIA_WAKE_MESSAGE_MAP must be valid JSON");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ConfigError("LUTOPIA_WAKE_MESSAGE_MAP must be a JSON object");
  }

  const messageMap: Record<WakeReason, string> = {};
  for (const [reason, message] of Object.entries(parsed)) {
    if (!isWakeReason(reason)) {
      throw new ConfigError(
        `LUTOPIA_WAKE_MESSAGE_MAP reason must be a non-empty string up to ${MAX_WAKE_REASON_LENGTH} characters`,
      );
    }
    if (
      typeof message !== "string" ||
      message.trim().length === 0 ||
      message.length > MAX_WAKE_MESSAGE_LENGTH
    ) {
      throw new ConfigError(
        `LUTOPIA_WAKE_MESSAGE_MAP.${reason} must be a non-empty string up to ${MAX_WAKE_MESSAGE_LENGTH} characters`,
      );
    }
    messageMap[reason] = message;
  }

  return Object.freeze(messageMap);
}

function parseInjectorWorkingDirectory(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) {
    return undefined;
  }
  if (!isAbsolute(value)) {
    throw new ConfigError("LUTOPIA_INJECTOR_WORKING_DIRECTORY must be an absolute path");
  }
  return value;
}

function parseInjectorArgs(raw: string | undefined): readonly string[] {
  if (!raw?.trim()) {
    return Object.freeze([]);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ConfigError("LUTOPIA_INJECTOR_ARGS_JSON must be valid JSON");
  }
  if (
    !Array.isArray(parsed) ||
    parsed.some((value) => typeof value !== "string" || value.includes("\0"))
  ) {
    throw new ConfigError("LUTOPIA_INJECTOR_ARGS_JSON must be a JSON array of strings");
  }
  return Object.freeze([...parsed]);
}

const MCP_PATH = /^\/mcp\/([A-Za-z0-9_-]{4,64})(?:\/sse)?\/?$/;

/** The agent's MCP link (https://lutopia.app/mcp/<code>/sse) carries its credential and the site origin. */
export function parseMcpUrl(raw: string): { readonly origin: string; readonly token: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ConfigError("LUTOPIA_MCP_URL must be the agent's MCP link, e.g. https://lutopia.app/mcp/xxxx/sse");
  }
  const match = MCP_PATH.exec(url.pathname);
  if (!match || url.search || url.hash || url.username || url.password) {
    throw new ConfigError("LUTOPIA_MCP_URL must look like https://lutopia.app/mcp/xxxx/sse");
  }
  return { origin: url.origin, token: match[1] as string };
}

function resolveCredential(env: NodeJS.ProcessEnv): { readonly baseUrl: string; readonly token: string } {
  const explicitBase = env.LUTOPIA_BASE_URL?.trim();
  const apiKey = env.LUTOPIA_API_KEY?.trim();
  const mcpUrl = env.LUTOPIA_MCP_URL?.trim();
  if (apiKey) {
    return { baseUrl: explicitBase || DEFAULT_LUTOPIA_BASE_URL, token: apiKey };
  }
  if (mcpUrl) {
    const parsed = parseMcpUrl(mcpUrl);
    return { baseUrl: explicitBase || parsed.origin, token: parsed.token };
  }
  throw new ConfigError("LUTOPIA_MCP_URL is required (paste your agent's MCP link), or set LUTOPIA_API_KEY");
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BridgeConfig {
  const credential = resolveCredential(env);
  return {
    baseUrl: validateGardenBaseUrl(credential.baseUrl),
    machineToken: credential.token,
    wakeMessageMap: parseWakeMessageMap(env.LUTOPIA_WAKE_MESSAGE_MAP),
    injector: Object.freeze({
      executable: env.LUTOPIA_INJECTOR_EXECUTABLE?.trim() || undefined,
      args: parseInjectorArgs(env.LUTOPIA_INJECTOR_ARGS_JSON),
      workingDirectory: parseInjectorWorkingDirectory(
        env.LUTOPIA_INJECTOR_WORKING_DIRECTORY,
      ),
    }),
    logLevel: parseLogLevel(env.LUTOPIA_LOG_LEVEL),
    timeouts: DEFAULT_TIMEOUTS,
  };
}
