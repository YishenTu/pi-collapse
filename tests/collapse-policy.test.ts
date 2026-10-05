import assert from "node:assert/strict";
import test from "node:test";
import {
	COLLAPSED_THINKING,
	isCollapsedThinking,
	parseCollapseArgument,
	TOGGLE_SHORTCUTS,
} from "../policy.ts";

test("collapses only thinking blocks", () => {
	assert.equal(isCollapsedThinking("assistant-thinking", false), true);
	assert.equal(isCollapsedThinking("assistant-thinking", true), false);
	assert.equal(isCollapsedThinking("assistant", false), false);
	assert.equal(isCollapsedThinking("user", false), false);
});

test("names the expand shortcut in the collapsed hint", () => {
	assert.ok(TOGGLE_SHORTCUTS.includes("ctrl+shift+o"));
	assert.match(COLLAPSED_THINKING, new RegExp(TOGGLE_SHORTCUTS[0].replace(/\+/g, "\\+")));
});

test("parses collapse arguments", () => {
	assert.equal(parseCollapseArgument(""), undefined);
	assert.equal(parseCollapseArgument("   "), undefined);
	assert.equal(parseCollapseArgument("on"), true);
	assert.equal(parseCollapseArgument(" SHOW "), true);
	assert.equal(parseCollapseArgument("off"), false);
	assert.equal(parseCollapseArgument("Collapse"), false);
	assert.equal(parseCollapseArgument("sideways"), "invalid");
});
