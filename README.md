# BombJack 🚗💥

> A retro **vertical-scrolling road shooter** — blast down the highway through 10 themed levels, dodge hazards, grab power-ups, beat the bosses, and climb the online leaderboard.

[![Play the demo](https://img.shields.io/badge/▶_Play-Live_Demo-ff2e97?style=for-the-badge)](https://danmat.github.io/BombJack/)
&nbsp;
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-no_dependencies-f7df1e)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

<p align="center">
  <img src="docs/screenshot.png" alt="BombJack gameplay — the player car firing up a highway lane at enemy cars" width="360" />
</p>

## Features

- 🎮 **Canvas game engine** — smooth 60fps, no jQuery, no dependencies. All art is drawn **procedurally** (no image assets).
- 🛣️ **10 themed levels** — Sunset Highway, Night City, Desert Run, Rush Hour, Tunnel, Coastal Bridge, Snowy Pass, Canyon, Neon Speedway and the Final Gauntlet, each ending in a **boss fight**.
- 👾 **Enemy variety** — cars, fast bikes, weaving cars, tanky trucks, and shooters that fire back.
- ⚡ **Power-ups** — spread / triple / rapid guns, shield, nitro-boost, extra life, and smart bombs.
- 🚧 **Road hazards** — dodge barriers, cones and slippery oil slicks on top of the enemies.
- 🔥 **Combo multiplier** — chain kills for up to 6× score.
- 🏆 **Online leaderboard** — enter your 3-letter initials; scores are shared across devices.
- 🕹️ **Play anywhere** — arrow keys / WASD, or drag on touch. Your gun auto-fires.

## Controls

| Action | Input |
| --- | --- |
| Steer | Arrow keys · WASD · touch drag |
| Fire | Automatic |
| Smart bomb | <kbd>Space</kbd> / <kbd>X</kbd> / 💣 button |
| Pause | <kbd>P</kbd> or <kbd>Esc</kbd> |

## High scores

High scores go to a **shared Cloudflare leaderboard** — a Worker + D1
([retroix-leaderboard](https://github.com/DanMat/retroix-leaderboard)) shared by all of
Dan's Retroix games and namespaced by `gameId`, so this game's board is its own. It
works out of the box (no account, no setup) and validates + caps scores server-side.
Blank `apiUrl` in [`js/config.js`](js/config.js) to fall back to a local
(per-browser) board.

> Any client-side leaderboard can be spoofed by a determined player — it's for fun, not competition.

## Play locally

Static site, no build step:

```bash
git clone https://github.com/DanMat/BombJack.git
cd BombJack
python3 -m http.server 8000   # then visit http://localhost:8000
```

## How it works

| File | Responsibility |
| --- | --- |
| `js/game.js` | Canvas engine: render loop, procedural sprites, physics, bosses, state machine. |
| `js/levels.js` | Pure-data level definitions (add a level = add an object). |
| `js/config.js` | Leaderboard API URL and game id. |

## Credits

Rebuilt in vanilla JavaScript from the original 2011 jQuery version.

## License

[MIT](LICENSE) © DanMat
