/**
 * Collapse Extension
 *
 * Collapses thinking blocks by default, and expands or collapses them all with a
 * single shortcut. Tool output keeps Pi's own Ctrl+O; `/collapse` drives both,
 * or just one with `/collapse thinking` or `/collapse tools`.
 *
 * Thinking blocks collapse through Pi's own per-block hidden state, so clicking a
 * block still expands or collapses just that block. Pi has no extension API for
 * that state, so the extension wraps `AssistantMessageComponent.updateContent`
 * to hide thinking while collapsed and to show the collapsed hint as the label.
 * The toggle asks Pi to rebuild the rendered assistant messages with
 * `ctx.ui.setHiddenThinkingLabel()`, which re-runs the wrapper and clears
 * per-block clicks.
 *
 * If a Pi update changes those component internals, the extension falls back to
 * a Markdown transformer that swaps collapsed thinking for the hint; clicking a
 * thinking block then can't expand it.
 *
 * Notes:
 * - Every session starts collapsed, and nothing is written to settings.
 * - Pi's own "hide thinking blocks" setting (Ctrl+T) takes precedence, so the
 *   extension warns once when that setting masks an expand.
 * - Rebuilding through `setHiddenThinkingLabel()` resets Pi's collapsed thinking
 *   label to its default.
 */

import { AssistantMessageComponent, type ExtensionAPI, type ExtensionContext } from "@earendil-works/pi-coding-agent";
import {
	COLLAPSED_THINKING,
	isCollapsedThinking,
	nextExpanded,
	parseCollapseCommand,
	TOGGLE_SHORTCUTS,
} from "./policy.ts";

/** Collapse state shared with the component wrapper, which outlives extension reloads. */
interface CollapseState {
	expanded: boolean;
	/** Bumped on every toggle so components drop per-block click overrides. */
	generation: number;
}

/** The private `AssistantMessageComponent` fields the wrapper relies on. */
interface ThinkingInternals {
	hideThinkingBlock: boolean;
	hiddenThinkingLabel: string;
	thinkingVisibilityOverrides: Map<number, boolean>;
	updateContent(...args: unknown[]): void;
	[SEEN_GENERATION]?: number;
}

const STATE = Symbol.for("pi-collapse.state");
const PATCHED = Symbol.for("pi-collapse.patched");
const SEEN_GENERATION = Symbol.for("pi-collapse.generation");

const globals = globalThis as { [STATE]?: CollapseState };
const state: CollapseState = (globals[STATE] ??= { expanded: false, generation: 0 });

function hasThinkingInternals(value: object): boolean {
	const probe = value as Partial<ThinkingInternals>;
	return (
		typeof probe.hideThinkingBlock === "boolean" &&
		typeof probe.hiddenThinkingLabel === "string" &&
		probe.thinkingVisibilityOverrides instanceof Map
	);
}

/** Wrap `updateContent` once per Pi process. Returns false when Pi's internals don't match. */
function patchAssistantMessages(): boolean {
	const proto = AssistantMessageComponent.prototype as unknown as ThinkingInternals & { [PATCHED]?: true };
	if (proto[PATCHED]) return true;
	if (typeof proto.updateContent !== "function") return false;
	try {
		if (!hasThinkingInternals(new AssistantMessageComponent())) return false;
	} catch {
		return false;
	}

	const original = proto.updateContent;
	proto.updateContent = function (this: ThinkingInternals, ...args: unknown[]) {
		if (this[SEEN_GENERATION] !== state.generation) {
			this[SEEN_GENERATION] = state.generation;
			this.thinkingVisibilityOverrides.clear();
		}
		const hide = this.hideThinkingBlock;
		const label = this.hiddenThinkingLabel;
		if (!state.expanded && !hide) {
			this.hideThinkingBlock = true;
			this.hiddenThinkingLabel = COLLAPSED_THINKING;
		}
		try {
			original.apply(this, args);
		} finally {
			this.hideThinkingBlock = hide;
			this.hiddenThinkingLabel = label;
		}
	};
	proto[PATCHED] = true;
	return true;
}

export default function (pi: ExtensionAPI) {
	let warnedAboutNativeHiddenThinking = false;

	if (!patchAssistantMessages()) {
		pi.registerMarkdownTransformer((markdown, context) =>
			isCollapsedThinking(context.messageType, state.expanded) ? COLLAPSED_THINKING : markdown,
		);
	}

	const setThinkingExpanded = (ctx: ExtensionContext, next: boolean) => {
		state.expanded = next;
		state.generation++;
		if (!ctx.hasUI || ctx.mode !== "tui") return;

		// Rebuild rendered assistant messages so thinking blocks pick up the new state.
		ctx.ui.setHiddenThinkingLabel();

		if (next && pi.getSettings().hideThinkingBlock && !warnedAboutNativeHiddenThinking) {
			warnedAboutNativeHiddenThinking = true;
			ctx.ui.notify("Pi's own hidden-thinking setting is on; press Ctrl+T to show thinking blocks.", "warning");
		}
	};

	for (const shortcut of TOGGLE_SHORTCUTS) {
		pi.registerShortcut(shortcut, {
			description: "Expand or collapse thinking blocks",
			handler: (ctx) => setThinkingExpanded(ctx, !state.expanded),
		});
	}

	pi.registerCommand("collapse", {
		description: "Expand or collapse thinking blocks and tool output. Use /collapse [thinking|tools] [on|off].",
		handler: async (args, ctx) => {
			const command = parseCollapseCommand(args);
			if (command === "invalid") {
				ctx.ui.notify(`Unknown argument "${args.trim()}". Use /collapse [thinking|tools] [on|off].`, "warning");
				return;
			}
			const thinking = command.target !== "tools";
			const tools = command.target !== "thinking" && ctx.hasUI;
			const current = [...(thinking ? [state.expanded] : []), ...(tools ? [ctx.ui.getToolsExpanded()] : [])];
			const next = nextExpanded(command.expand, current);
			if (thinking) setThinkingExpanded(ctx, next);
			if (tools) ctx.ui.setToolsExpanded(next);
		},
	});

	pi.on("session_start", () => {
		state.expanded = false;
		state.generation++;
		warnedAboutNativeHiddenThinking = false;
	});
}
