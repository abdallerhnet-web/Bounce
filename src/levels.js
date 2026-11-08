// Levels are data: a feature list per world, compiled to ASCII tile maps.
// Legend: # ground  I ice  B breakable  ? knowledge block  V vanishing
//         S spring  s spikes  > speed pad  c coin  e enemy  K checkpoint
//         G goal  X boss  P start
const ROWS = 14;

function build(cols, feats) {
  const g = Array.from({ length: ROWS }, () => Array(cols).fill('.'));
  for (let x = 0; x < cols; x++) { g[12][x] = '#'; g[13][x] = '#'; }
  const set = (x, y, c) => { if (x >= 0 && x < cols && y >= 0 && y < ROWS) g[y][x] = c; };
  for (const [t, ...a] of feats) {
    if (t === 'gap') for (let i = 0; i < a[1]; i++) { set(a[0] + i, 12, '.'); set(a[0] + i, 13, '.'); }
    else if (t === 'p') for (let i = 0; i < a[2]; i++) set(a[0] + i, a[1], a[3] || '#');
    else if (t === 't') set(a[0], a[1], a[2]);
    else if (t === 'coins') for (let i = 0; i < a[2]; i++) set(a[0] + i, a[1], 'c');
    else if (t === 'e') set(a[0], 11, 'e');
    else if (t === 'spring') set(a[0], 11, 'S');
    else if (t === 'spike') for (let i = 0; i < a[1]; i++) set(a[0] + i, 11, 's');
    else if (t === 'ice') { for (let i = 0; i < a[1]; i++) { if (g[12][a[0] + i] === '#') set(a[0] + i, 12, 'I'); } }
    else if (t === 'boost') for (let i = 0; i < a[1]; i++) set(a[0] + i, 11, '>');
    else if (t === 'wall') for (let i = 0; i < a[1]; i++) set(a[0], 11 - i, a[2] || '#');
    else if (t === 'cp') set(a[0], 11, 'K');
    else if (t === 'goal') set(a[0], 11, 'G');
    else if (t === 'boss') set(a[0], 11, 'X');
  }
  set(2, 11, 'P');
  return g.map((r) => r.join(''));
}

const q = (...n) => n; // readability

export const WORLDS = [
  {
    name: 'Sunlit Origin', tag: 'Golden ruins of the first chain.', boss: { name: 'The Broken Guardian', hp: 4, col: '#d9a441' },
    theme: { kind: 'ruins', sky: ['#ffd98a', '#ff9a62'], sun: '#fff3b0', ground: '#8a6a3a', top: '#d7a83a', topLight: '#ffe27a', far: '#c98a4e', mid: '#a8703c', enemy: '#7a4aa8' },
    terms: [
      ['Wallet', 'An app that holds your keys. Your coins live on the chain; the wallet just proves they are yours.'],
      ['Seed Phrase', 'Secret words that rebuild your wallet. Anyone who has them owns your funds. Never share them.'],
      ['Private Key', 'The secret number that signs your transactions. Lose it and the coins are gone for good.'],
      ['Gas Fee', 'A small fee paid to the network for processing your transaction.'],
      ['Blockchain', 'A shared ledger copied across many computers, where past records are very hard to change.'],
    ],
    map: build(124, [
      q('coins', 8, 10, 4), q('t', 12, 8, '?'), q('e', 18), q('p', 22, 10, 4), q('coins', 22, 9, 4), q('t', 25, 8, '?'),
      q('gap', 30, 3), q('coins', 30, 9, 3), q('spring', 36), q('p', 38, 6, 5), q('t', 40, 3, '?'), q('coins', 38, 5, 5),
      q('e', 46), q('spike', 50, 3), q('coins', 49, 8, 5), q('cp', 56), q('e', 60), q('e', 64),
      q('p', 68, 10, 3), q('p', 72, 8, 3), q('p', 76, 10, 3), q('t', 73, 5, '?'),
      q('wall', 84, 4, 'B'), q('t', 86, 8, '?'), q('coins', 87, 11, 3),
      q('cp', 92), q('boss', 108), q('goal', 120),
    ]),
  },
  {
    name: 'Bytewood Grove', tag: 'An enchanted forest eaten by corrupted code.', boss: { name: 'Rootbyte', hp: 5, col: '#5fbf4a' },
    theme: { kind: 'forest', sky: ['#0f3d2e', '#3f9a62'], sun: '#d9ff9a', ground: '#3a2a1c', top: '#3fb55a', topLight: '#8aff7a', far: '#14543a', mid: '#0f6b44', enemy: '#8bc34a' },
    terms: [
      ['DeFi', 'Decentralized finance: lending, trading and saving run by code instead of a bank.'],
      ['Staking', 'Locking coins to help secure a network, usually in return for rewards.'],
      ['Rug Pull', 'When creators drain the money and vanish. Platforms that disappear under your feet: watch the ground!'],
      ['Airdrop', 'Free tokens sent to wallets. Scammers fake them, so never connect to a random airdrop site.'],
      ['Smart Contract', 'A program on the chain that runs exactly as written, with no middleman.'],
    ],
    map: build(122, [
      q('coins', 8, 10, 3), q('t', 10, 8, '?'), q('e', 16), q('spring', 20), q('p', 22, 7, 4), q('t', 23, 4, '?'),
      q('gap', 30, 6), q('p', 30, 10, 2, 'V'), q('p', 34, 10, 2, 'V'), q('coins', 30, 9, 6),
      q('e', 40), q('e', 44), q('p', 48, 10, 3), q('p', 52, 8, 3), q('t', 53, 5, '?'), q('p', 56, 10, 3),
      q('cp', 60), q('spike', 64, 4), q('gap', 70, 5), q('p', 70, 10, 2, 'V'), q('p', 73, 10, 2, 'V'), q('coins', 70, 9, 5),
      q('e', 78), q('t', 80, 8, '?'), q('spring', 84), q('p', 86, 6, 4), q('t', 88, 3, '?'), q('coins', 86, 5, 4),
      q('cp', 94), q('boss', 106), q('goal', 118),
    ]),
  },
  {
    name: 'Neon Circuit', tag: 'A city running on unstable energy.', boss: { name: 'Volt-X', hp: 5, col: '#ffe14a' },
    theme: { kind: 'city', sky: ['#120a2e', '#5b1a7a'], sun: '#ff4fd8', ground: '#1b1a33', top: '#00e5ff', topLight: '#9ffbff', far: '#2a1f5c', mid: '#3b2a88', enemy: '#ffe14a' },
    terms: [
      ['Phishing', 'A fake site or message that tricks you into revealing keys. Check the URL every time.'],
      ['FOMO', 'Fear of missing out. Rushing in because everyone else is, which is how people overpay.'],
      ['Liquidity Pool', 'A pot of tokens that lets people trade without a traditional exchange.'],
      ['DYOR', 'Do your own research. Do not trust hype, check for yourself.'],
      ['Stablecoin', 'A token designed to hold a steady price, like one dollar.'],
    ],
    map: build(142, [
      q('coins', 8, 10, 3), q('boost', 10, 2), q('t', 16, 8, '?'), q('e', 22), q('e', 26), q('spike', 30, 2),
      q('boost', 32, 2), q('gap', 36, 4), q('coins', 36, 8, 4), q('t', 42, 8, '?'),
      q('p', 46, 10, 3), q('p', 50, 8, 3), q('p', 54, 6, 3), q('t', 55, 3, '?'), q('e', 60), q('cp', 64),
      q('spike', 68, 3), q('p', 68, 8, 3), q('e', 74), q('e', 77), q('boost', 80, 2), q('gap', 86, 5), q('coins', 86, 8, 5),
      q('t', 96, 8, '?'), q('spring', 100), q('p', 102, 5, 5), q('t', 104, 2, '?'),
      q('cp', 110), q('e', 114), q('e', 118), q('boss', 126), q('goal', 138),
    ]),
  },
  {
    name: 'Crystal Frontier', tag: 'A frozen world where time itself seems broken.', boss: { name: 'Glacius', hp: 6, col: '#8fdcff' },
    theme: { kind: 'ice', sky: ['#0b2a4a', '#8fd3ff'], sun: '#eaf6ff', ground: '#8fb2cc', top: '#ffffff', topLight: '#ffffff', far: '#6a9ccc', mid: '#8ab8dc', enemy: '#bff0ff' },
    terms: [
      ['Slippage', 'The gap between the price you expected and the price you got. Like ice, things slide.'],
      ['HODL', 'Hold on for dear life: keeping your coins through the ups and downs.'],
      ['Liquidation', 'When a leveraged position is force-closed because the price moved against it.'],
      ['Leverage', 'Borrowing to make a bigger bet. It magnifies gains and losses alike.'],
      ['Volatility', 'How wildly a price swings. High volatility means high risk.'],
    ],
    map: build(132, [
      q('coins', 8, 10, 3), q('t', 12, 8, '?'), q('ice', 16, 14), q('e', 20), q('spike', 26, 2),
      q('t', 32, 8, '?'), q('gap', 34, 3), q('ice', 37, 10), q('p', 40, 10, 3), q('coins', 40, 9, 3), q('t', 44, 8, '?'),
      q('gap', 50, 3), q('ice', 53, 12), q('e', 56), q('e', 60), q('cp', 62), q('spring', 66),
      q('p', 68, 5, 4), q('t', 70, 2, '?'), q('coins', 68, 4, 4), q('gap', 76, 3), q('gap', 82, 3), q('ice', 85, 10),
      q('t', 88, 8, '?'), q('spike', 92, 3), q('cp', 98), q('e', 100), q('cp', 106), q('boss', 116), q('goal', 128),
    ]),
  },
  {
    name: 'Solana Gate', tag: 'The ancient gateway where it all began.', boss: { name: 'The Null King', hp: 8, col: '#b388ff' },
    theme: { kind: 'gate', sky: ['#0a0a1e', '#3a0f5e'], sun: '#b388ff', ground: '#23203d', top: '#b388ff', topLight: '#e0ccff', far: '#2b2060', mid: '#44338a', enemy: '#ff5c8a' },
    terms: [
      ['Solana', 'A fast, low-fee blockchain built for apps that need speed.'],
      ['Validator', 'A computer that checks transactions and keeps the network honest.'],
      ['Bridge', 'A tool that moves tokens between blockchains. Bridges are popular targets for hackers.'],
      ['DAO', 'A community-run organization that votes on decisions with tokens.'],
      ['Self-Custody', 'Holding your own keys. Not your keys, not your coins.'],
    ],
    map: build(150, [
      q('coins', 8, 10, 3), q('t', 12, 8, '?'), q('e', 18), q('boost', 22, 2), q('gap', 28, 5), q('p', 28, 10, 2, 'V'), q('p', 31, 10, 2, 'V'),
      q('coins', 28, 9, 5), q('cp', 36), q('spring', 40), q('p', 42, 6, 4), q('t', 44, 3, '?'),
      q('ice', 50, 12), q('e', 54), q('spike', 60, 3), q('t', 64, 8, '?'), q('gap', 70, 3), q('ice', 74, 10), q('e', 80), q('e', 83),
      q('cp', 88), q('boost', 92, 2), q('gap', 96, 5), q('p', 96, 10, 2, 'V'), q('p', 99, 10, 2, 'V'),
      q('t', 104, 8, '?'), q('e', 108), q('e', 111), q('spring', 114), q('p', 116, 5, 4), q('t', 118, 2, '?'),
      q('cp', 124), q('boss', 134), q('goal', 146),
    ]),
  },
];

export const ALL_TERMS = WORLDS.flatMap((w, wi) => w.terms.map((t, i) => ({ id: `${wi}.${i}`, world: wi, name: t[0], def: t[1] })));
