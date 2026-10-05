/**
 * Pure decisions for the collapse extension: what a shortcut/command asks for and
 * what a collapsed thinking block renders as. Kept free of Pi APIs so the unit
 * tests can run without a Pi host.
 */

/** Shortcuts that expand or collapse thinking blocks. */
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
const TARGET_ARGUMENTS = new Map<string, CollapseTarget>([
	["thinking", "thinking"],
	["tools", "tools"],
	["tool", "tools"],
]);

/** What a `/collapse` command applies to. */
export type CollapseTarget = "both" | "thinking" | "tools";

/** A parsed `/collapse` command: its target and requested state (`undefined` toggles). */
export interface CollapseCommand {
	target: CollapseTarget;
	expand: boolean | undefined;
}

/**
 * Translate `/collapse` arguments into a command: an optional target
 * (`thinking` or `tools`, default both) followed by an optional state.
 * Returns `"invalid"` for anything else.
 */
export function parseCollapseCommand(args: string): CollapseCommand | "invalid" {
	const words = args.trim().toLowerCase().split(/\s+/).filter(Boolean);
	const target = TARGET_ARGUMENTS.get(words[0] ?? "");
	if (target) words.shift();
	if (words.length > 1) return "invalid";

	const command: CollapseCommand = { target: target ?? "both", expand: undefined };
	if (words.length === 0) return command;
	if (EXPAND_ARGUMENTS.has(words[0])) return { ...command, expand: true };
	if (COLLAPSE_ARGUMENTS.has(words[0])) return { ...command, expand: false };
	return "invalid";
}

/**
 * The state to apply: the requested one, or a toggle that collapses everything
 * when anything targeted is expanded and expands everything otherwise.
 */
export function nextExpanded(requested: boolean | undefined, current: readonly boolean[]): boolean {
	return requested ?? !current.some(Boolean);
}
