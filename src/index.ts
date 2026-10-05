/**
 * Collapse Extension
 *
 * Collapses thinking blocks and tool output by default, and expands or collapses
 * both with a single shortcut.
 *
 * Thinking blocks render as a one-line hint while collapsed through a Markdown
 * transformer. Pi runs the transformer whenever it rebuilds message content, so
 * the toggle asks Pi to rebuild the rendered assistant messages with
 * `ctx.ui.setHiddenThinkingLabel()` to re-render the existing transcript. Tool
 * output uses Pi's built-in collapsed and expanded rendering through
 * `ctx.ui.setToolsExpanded()`.
 *
 * Notes:
 * - Every session starts collapsed, and nothing is written to settings.
 * - Pi's own "hide thinking blocks" setting (Ctrl+T) takes precedence over the
 *   transformer, so the extension warns once when that setting masks an expand.
 * - Rebuilding through `setHiddenThinkingLabel()` resets Pi's collapsed thinking
 *   label to its default.
 */

import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { COLLAPSED_THINKING, isCollapsedThinking, parseCollapseArgument, TOGGLE_SHORTCUTS } from "./policy.ts";

export default function (pi: ExtensionAPI) {
	let expanded = false;
	let warnedAboutNativeHiddenThinking = false;

	pi.registerMarkdownTransformer((markdown, context) =>
		isCollapsedThinking(context.messageType, expanded) ? COLLAPSED_THINKING : markdown,
	);

	const setExpanded = (ctx: ExtensionContext, next: boolean) => {
		expanded = next;
		if (!ctx.hasUI) return;

		ctx.ui.setToolsExpanded(next);
		if (ctx.mode !== "tui") return;

		// Rebuild rendered assistant messages so the transformer re-runs with the new state.
		ctx.ui.setHiddenThinkingLabel();

		if (next && pi.getSettings().hideThinkingBlock && !warnedAboutNativeHiddenThinking) {
			warnedAboutNativeHiddenThinking = true;
			ctx.ui.notify("Pi's own hidden-thinking setting is on; press Ctrl+T to show thinking blocks.", "warning");
		}
	};

	for (const shortcut of TOGGLE_SHORTCUTS) {
		pi.registerShortcut(shortcut, {
			description: "Expand or collapse thinking blocks and tool output",
			handler: (ctx) => setExpanded(ctx, !expanded),
		});
	}

	pi.registerCommand("collapse", {
		description: "Expand or collapse thinking blocks and tool output. Use /collapse on or /collapse off.",
		handler: async (args, ctx) => {
			const requested = parseCollapseArgument(args);
			if (requested === "invalid") {
				ctx.ui.notify(`Unknown argument "${args.trim()}". Use /collapse, /collapse on, or /collapse off.`, "warning");
				return;
			}
			setExpanded(ctx, requested ?? !expanded);
		},
	});

	pi.on("session_start", (_event, ctx) => {
		expanded = false;
		warnedAboutNativeHiddenThinking = false;
		if (ctx.hasUI) ctx.ui.setToolsExpanded(false);
	});
}
