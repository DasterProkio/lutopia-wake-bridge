import type { Readable, Writable } from "node:stream";
import type { Logger } from "../logging.js";
import type { RuntimeAdapter, RuntimeWakeInput } from "./adapter.js";
interface SpawnedInjectorProcess {
    readonly stdin: Writable;
    readonly stderr: Readable;
    once(event: "error", listener: (error: Error) => void): this;
    once(event: "exit", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
    kill(signal?: NodeJS.Signals): boolean;
}
interface InjectorSpawnOptions {
    readonly shell: false;
    readonly signal: AbortSignal;
    readonly stdio: ["pipe", "ignore", "pipe"];
    readonly cwd?: string;
    readonly env: NodeJS.ProcessEnv;
}
export interface InstalledInjectorConfig {
    readonly executable: string;
    readonly args: readonly string[];
    readonly workingDirectory: string | undefined;
}
export type SpawnInjector = (executable: string, args: readonly string[], options: InjectorSpawnOptions) => SpawnedInjectorProcess;
export declare class InjectorDeliveryError extends Error {
    constructor(message: string);
}
export declare class CommandInjectorAdapter implements RuntimeAdapter {
    #private;
    constructor(config: Readonly<InstalledInjectorConfig>, logger: Logger, spawnImpl?: SpawnInjector);
    wake(input: RuntimeWakeInput): Promise<void>;
}
export {};
