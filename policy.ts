/**
 * Pure decisions for the collapse extension: what a shortcut/command asks for and
 * what a collapsed thinking block renders as. Kept free of Pi APIs so the checks
 * in `tsconfig.json` and `tests/` can run without the Pi type package.
 */

/** Shortcuts that expand or collapse thinking blocks and tool output. */
export const TOGGLE_SHORTCUTS = ["ctrl+shift+o", "alt+o"] as const;

/** Replaces a thinking block while it is collapsed. */
export const COLLAPSED_THINKING = `Thinking… (${TOGGLE_SHORTCUTS[0]} to expand)`;

/** Markdown message types Pi can ask an extension to transform. */
export type MarkdownMessageType = "user" | "assistant" | "assistant-thinking";

/** Whether a rendered Markdown block is a thinking block that should be collapsed. */
export function isCollapsedThinking(messageType: MarkdownMessageType, expanded: boolean): boolean {
	return messageType === "assistant-thinking" && !expanded;
}

const EXPAND_ARGUMENTS = new Set(["on", "show", "expand", "open"]);
const COLLAPSE_ARGUMENTS = new Set(["off", "hide", "collapse", "close"]);

/**
 * Translate a `/collapse` argument into the requested state.
 * Returns `undefined` for no argument (toggle) and `"invalid"` for anything else.
 */
export function parseCollapseArgument(args: string): boolean | undefined | "invalid" {
	const value = args.trim().toLowerCase();
	if (value.length === 0) return undefined;
	if (EXPAND_ARGUMENTS.has(value)) return true;
	if (COLLAPSE_ARGUMENTS.has(value)) return false;
	return "invalid";
}
