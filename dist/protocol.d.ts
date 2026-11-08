import type { SseEvent } from "./sse/parser.js";
export declare const GARDEN_PROTOCOL: {
    readonly version: 1;
    readonly streamPath: "/wake/v1/stream";
    readonly events: {
        readonly connected: "connected";
        readonly wake: "wake";
        readonly superseded: "superseded";
    };
    readonly reasons: {
        readonly strongholdTurn: "stronghold_turn";
        readonly strongholdResult: "stronghold_result";
        readonly stardewTick: "stardew_tick";
        readonly stardewChat: "stardew_chat";
        readonly stardewDialogue: "stardew_dialogue";
        readonly stardewLate: "stardew_late";
        readonly inboxUnread: "inbox_unread";
    };
};
export type WakeReason = string;
export declare const MAX_WAKE_MESSAGE_LENGTH = 4096;
export declare const MAX_WAKE_REASON_LENGTH = 128;
export type RuntimeWake = Readonly<{
    reason: WakeReason;
    message: string;
}>;
export interface ProtocolDiagnostic<Severity extends "debug" | "warn" | "terminal" = "debug" | "warn" | "terminal"> {
    readonly cause: string;
    readonly severity: Severity;
}
export type GardenProtocolEvent = {
    kind: "connected";
    version: number;
} | ({
    kind: "wake";
} & RuntimeWake) | ({
    kind: "ignored";
} & ProtocolDiagnostic);
export declare function isWakeReason(value: unknown): value is WakeReason;
export declare function decodeGardenEvent(event: SseEvent): GardenProtocolEvent;
