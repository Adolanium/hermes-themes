# hermes-themes

Custom themes for [Hermes Agent](https://github.com/NousResearch/hermes-agent).

A collection of custom desktop themes. Each one lives in its own folder.

Themes change how Hermes looks. They don't change how the agent thinks or how many tokens it uses.

## Themes

| Folder | What it is |
| --- | --- |
| `ee.dd` | Forest chrome, cream wordmark, dusk riverbank behind the chat. Named after him. |

## Install a theme

Each theme in this repo is one folder. Copy that whole folder into Hermes Desktop plugins. Don't dump the files loose. The folder name is the theme's slug.

Then copy the YAML skin into Hermes skins. Same name as the folder.

Hermes looks here:

**Mac and Linux**

```
~/.hermes/desktop-plugins/
~/.hermes/skins/
```

**Windows**

```
%LOCALAPPDATA%\hermes\desktop-plugins\
%LOCALAPPDATA%\hermes\skins\
```

If you use a named Hermes profile, put it under that profile instead:

```
~/.hermes/profiles/<name>/desktop-plugins/
~/.hermes/profiles/<name>/skins/
```

You want this layout (ee.dd as an example):

```
desktop-plugins/
  ee.dd/
    plugin.js
    wallpaper.jpg
    ee.dd.yaml

skins/
  ee.dd.yaml
```

Copy the whole `ee.dd` folder into `desktop-plugins`. Then copy `ee.dd.yaml` into `skins/` too. Same file, two homes. The plugin reads the wallpaper from its folder. The skin file is what `/skin` and `hermes config set display.skin` pick up.

Then tell Hermes to use it. Swap in the folder name:

```
hermes config set display.skin ee.dd
```

In Hermes Desktop, run **Reload desktop plugins** from the command palette. Open a new session to see the splash.

If the painting doesn't show, the plugin folder name has to match the slug (`ee.dd`), and `wallpaper.jpg` has to sit next to `plugin.js`.

## What's in the folder

| File | What it is |
| --- | --- |
| `plugin.js` | Desktop theme, wallpaper, and wordmark |
| `wallpaper.jpg` | Backdrop for the chat |
| `ee.dd.yaml` | CLI / TUI / desktop palette (name must match the folder) |

## Revert

```
hermes config set display.skin default
```

You can also turn the plugin off under Settings → Plugins.
