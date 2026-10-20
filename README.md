# Ten Stops to You

A 10-day birthday countdown. One stop unlocks each day at midnight (her phone's time). Each stop has a short story and a small game she has to finish. The last page, with your photo and story, opens on the birthday once all 10 stops are done.

## Files

| File | What it is |
|---|---|
| `config.js` | **The only file you need to edit.** Her name, dates, every day's story, the final photo and story. |
| `index.html`, `style.css`, `script.js` | The site itself. Leave these alone unless you want to change the design. |
| `assets/` | `anju.jpg` (final page), `anju-square.jpg` (puzzle and cards), `vipul.jpg`. Replace with others any time, same names. |

## Daily routine

1. Open `config.js`, edit that day's `story`, `title` and `done` text.
2. Commit and push. GitHub Pages updates in about a minute.

You can also write all 10 days now and only change the final page later.

## Put it on GitHub Pages

1. Create a new repository on github.com (it can be private on paid plans, public otherwise). Example name: `ten-stops`.
2. Upload every file in this folder to the repository root (drag and drop on the "Add file → Upload files" page works).
3. Go to **Settings → Pages**. Under "Build and deployment", pick **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the site is at `https://<your-username>.github.io/ten-stops/`. Send her that link.

## Testing (your private link)

Open `https://<your-username>.github.io/ten-stops/?test=vipul-tests-it` (the key is `testKey` in config.js; change it to anything).
A test bar appears at the top:

- **Unlock everything**: every stop and the final page open, so you can play all of it.
- **Pretend today is [date]**: the real date locks apply as if it were that day. Pick 25 Oct and you'll see stops 10–6 open, 5 and below locked, and the teasing pop-ups when you tap them.
- **Mark all 10 done**: lets you check the final page under a pretend date of 30 Oct.
- **Reset progress**: clears what's been played on this browser.

Without the key, nobody sees the test bar and the dates are enforced. Progress is saved per browser, so your testing never touches her phone.

## Games available

`envelope`, `balloons`, `hold`, `scratch`, `drag`, `arrow`, `catch`, `letters` (spells `herName`), `candle` (uses the mic, with a hold-to-blow fallback), `slide`, `match` (memory cards with your photos), `join` (her half-heart onto yours), `puzzle` (her photo in 9 pieces).
Set any day's `activity` to any of these.
