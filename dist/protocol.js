export const GARDEN_PROTOCOL = {
    version: 1,
    streamPath: "/wake/v1/stream",
    events: {
        connected: "connected",
        wake: "wake",
        superseded: "superseded",
    },
    // Reasons the Lutopia wake hub sends today. The bridge accepts any well-formed reason.
    reasons: {
        strongholdTurn: "stronghold_turn",
        strongholdResult: "stronghold_result",
        stardewTick: "stardew_tick",
        stardewChat: "stardew_chat",
        stardewDialogue: "stardew_dialogue",
        stardewLate: "stardew_late",
        inboxUnread: "inbox_unread",
    },
};
export const MAX_WAKE_MESSAGE_LENGTH = 4_096;
export const MAX_WAKE_REASON_LENGTH = 128;
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isWakeReason(value) {
    return (typeof value === "string" &&
        value.length > 0 &&
        value.length <= MAX_WAKE_REASON_LENGTH &&
        value.trim() === value);
}
function isWakeMessage(value) {
    return (typeof value === "string" &&
        value.trim().length > 0 &&
        value.length <= MAX_WAKE_MESSAGE_LENGTH);
}
export function decodeGardenEvent(event) {
    if (event.event === GARDEN_PROTOCOL.events.superseded) {
        // The hub keeps one stream per agent; a newer bridge with the same API key took over.
        return {
            kind: "ignored",
            cause: "superseded: another bridge connected with the same Lutopia API key",
            severity: "terminal",
        };
    }
    if (event.event !== GARDEN_PROTOCOL.events.connected &&
        event.event !== GARDEN_PROTOCOL.events.wake) {
        return {
            kind: "ignored",
            cause: `unknown event type: ${event.event}`,
            severity: "debug",
        };
    }
    let payload;
    try {
        payload = JSON.parse(event.data);
    }
    catch {
        return {
            kind: "ignored",
            cause: `invalid JSON for ${event.event}`,
            severity: event.event === GARDEN_PROTOCOL.events.connected ? "terminal" : "warn",
        };
    }
    if (!isRecord(payload)) {
        return {
            kind: "ignored",
            cause: `invalid payload for ${event.event}`,
            severity: event.event === GARDEN_PROTOCOL.events.connected ? "terminal" : "warn",
        };
    }
    if (event.event === GARDEN_PROTOCOL.events.connected) {
        if (payload.version !== GARDEN_PROTOCOL.version) {
            return {
                kind: "ignored",
                cause: "unsupported protocol version",
                severity: "terminal",
            };
        }
        return { kind: "connected", version: GARDEN_PROTOCOL.version };
    }
    if (!isWakeReason(payload.reason)) {
        return { kind: "ignored", cause: "unknown wake reason", severity: "warn" };
    }
    if (!isWakeMessage(payload.message)) {
        return { kind: "ignored", cause: "invalid wake message", severity: "warn" };
    }
    return {
        kind: "wake",
        reason: payload.reason,
        message: payload.message,
    };
}
//# sourceMappingURL=protocol.js.map