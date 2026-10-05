# Collapse

Collapses thinking blocks in [Pi](https://github.com/earendil-works/pi), toggled with one shortcut or a click.

Every session starts with thinking blocks collapsed to a one-line `Thinking…` hint. One keypress expands or collapses them all. Tool output stays on Pi's own **Ctrl+O**.

## Install

```sh
pi install git:github.com/YishenTu/pi-collapse
```

Or try it for one session without installing:

```sh
pi -e git:github.com/YishenTu/pi-collapse
```

## Usage

| Key | Action |
| --- | --- |
| **Ctrl+Shift+O** or **Alt+O** | Expand or collapse all thinking blocks |
| Click a thinking block | Expand or collapse just that block |
| **Ctrl+O** (Pi built-in) | Expand or collapse tool output |
| `/collapse` | Toggle thinking and tool output together |
| `/collapse thinking` / `/collapse tools` | Toggle just one |
| `/collapse [thinking\|tools] on` / `off` | Expand / collapse |

`/collapse` also accepts `show`/`expand`/`open` and `hide`/`collapse`/`close`. When thinking and tool output are in different states, a plain `/collapse` collapses both.

## Good to know

- Nothing is written to settings; each new session starts collapsed.
- The shortcut and `/collapse` apply to every thinking block and reset blocks you clicked open or shut.
- Pi's own hidden-thinking setting (**Ctrl+T**) takes precedence. If it's on when you expand, you'll get a one-time warning.
- Toggling resets Pi's collapsed-thinking label to its default.

## Development

```sh
npm install
npm run check   # type-check
npm test        # unit tests
```
