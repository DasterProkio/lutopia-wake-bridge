import { type BridgeConfig } from "../config.js";
import type { Logger } from "../logging.js";
import type { RuntimeAdapter } from "./adapter.js";
export declare function createRuntimeAdapter(config: BridgeConfig, logger: Logger): RuntimeAdapter;
