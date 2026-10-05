import assert from "node:assert/strict";
import test from "node:test";
import {
	COLLAPSED_THINKING,
	isCollapsedThinking,
	nextExpanded,
	parseCollapseCommand,
	TOGGLE_SHORTCUTS,
} from "../src/policy.ts";

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

test("parses collapse commands", () => {
	assert.deepEqual(parseCollapseCommand(""), { target: "both", expand: undefined });
	assert.deepEqual(parseCollapseCommand("   "), { target: "both", expand: undefined });
	assert.deepEqual(parseCollapseCommand("on"), { target: "both", expand: true });
	assert.deepEqual(parseCollapseCommand(" SHOW "), { target: "both", expand: true });
	assert.deepEqual(parseCollapseCommand("Collapse"), { target: "both", expand: false });
	assert.deepEqual(parseCollapseCommand("thinking"), { target: "thinking", expand: undefined });
	assert.deepEqual(parseCollapseCommand("tools off"), { target: "tools", expand: false });
	assert.deepEqual(parseCollapseCommand("tool  open"), { target: "tools", expand: true });
	assert.equal(parseCollapseCommand("sideways"), "invalid");
	assert.equal(parseCollapseCommand("thinking sideways"), "invalid");
	assert.equal(parseCollapseCommand("on thinking"), "invalid");
	assert.equal(parseCollapseCommand("thinking on off"), "invalid");
});

test("toggles to collapsed when anything targeted is expanded", () => {
	assert.equal(nextExpanded(undefined, [false, false]), true);
	assert.equal(nextExpanded(undefined, [true, false]), false);
	assert.equal(nextExpanded(undefined, [true, true]), false);
	assert.equal(nextExpanded(true, [true, true]), true);
	assert.equal(nextExpanded(false, [false]), false);
});
