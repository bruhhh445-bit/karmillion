# Karmillion

Telegram Mini App game for the Trinoko channel: from broke to billionaire, every choice has karma.

- Game: https://bruhhh445-bit.github.io/karmillion/
- Bot: Telegram Mini App pointing at the URL above

## How it works (all free)

| Part | Where |
|---|---|
| Game (Vite, plain JS) | GitHub Pages, auto-deployed by `.github/workflows/pages.yml` on every push to `main` |
| Player saves | Telegram CloudStorage (fallback: localStorage) |
| Leaderboard, promo codes, episode votes | Firebase Firestore, Spark plan, anonymous auth |
| Ads | Adsgram: rewarded `53879`, interstitial `int-53880`, task `task-53881` |

Nothing in this repo is secret. **Never commit the bot token or Google service-account keys.**

## Files

- `src/config.js` – Firebase config, Adsgram IDs, YouTube link, boost/offline settings
- `src/economy.js` – businesses, prices, wealth tiers
- `src/episodes.js` – story episodes (add one per new short)
- `src/main.js` – game UI and logic
- `src/hero.js`, `src/style.css` – the blocky hero and the look
- `firestore.rules` – paste into Firebase Console → Firestore → Rules

## Promo codes

Firebase Console → Firestore → Start collection `codes` → Document ID = the code in CAPS (e.g. `KARMA14`) → fields:

- `reward` (number) – cash
- `minutes` (number, optional) – pay this many minutes of the player's income if bigger
- `label` (string, optional) – title in the reward popup
- `expires` (timestamp, optional)

## Adding an episode

Copy an object in `src/episodes.js`, change `id`, `title`, `hook`, `scenes` and `choice`, push to `main`. It goes live in about a minute.

## Local run

```bash
npm install
npm run dev
```
