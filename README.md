# Collapse

Collapses thinking blocks and tool output in [Pi](https://github.com/earendil-works/pi), toggled with one shortcut.

Every session starts collapsed: thinking blocks show as a one-line `Thinking…` hint and tool output uses Pi's collapsed view. One keypress expands or collapses both.

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
| **Ctrl+Shift+O** or **Alt+O** | Expand or collapse thinking and tool output |
| `/collapse` | Toggle |
| `/collapse on` / `/collapse off` | Expand / collapse |

`/collapse` also accepts `show`/`expand`/`open` and `hide`/`collapse`/`close`.

## Good to know

- Nothing is written to settings; each new session starts collapsed.
- Pi's own hidden-thinking setting (**Ctrl+T**) takes precedence. If it's on when you expand, you'll get a one-time warning.
- Toggling resets Pi's collapsed-thinking label to its default.

## Development

```sh
npm install
npm run check   # type-check
npm test        # unit tests
```
