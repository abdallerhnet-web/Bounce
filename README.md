# BOUNCE: A Coin Journey to Solana

Original side-scroller. Roll, jump and spin-dash through five worlds, learn crypto basics from "?" blocks, beat a boss per world.
*Education, not financial advice.* No wallet, no blockchain, no real money.

## Run
    npm run dev        # python3 static server on :5173
    npm run build      # no build step: static ES modules, deploy the folder as-is

## Controls
Arrows/A/D move · Space/W jump · X spin attack · Esc pause · B dictionary · touch buttons on mobile.

## Structure
    index.html          shell, CSS, touch controls
    src/main.js         screens (menu, worlds, dictionary, settings, pause), game loop
    src/game.js         physics, enemies, boss, rendering, parallax backdrops
    src/levels.js       data-driven levels (feature lists -> tile maps), worlds, lessons
    src/engine.js       input, Web Audio sfx + per-world music
    src/save.js         localStorage save
