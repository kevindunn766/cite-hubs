# Cite Hubs

Source-linked tables for **money, local NC/FL rules, and jobsite-as-work**.

Not exam prep. Certification pathways stay on [PassLat](https://passlat.com). Brand split: `All_Sites/Passlat.com/docs/BRAND-BOUNDARY.md` and `Desktop/COMPILATION-TABLES-SITE-PLAN.md`.

Live tables ship as HTML + `/x.json` + `/x.md`, with named compiler, as-of date, and outbound official sources. No ads on fact URLs.

## Run

```
npm install
npm start
```

Listens on `PORT` (default 8080). `/health` returns `ok`.

## Add a table

1. Drop a JSON file in `data/` matching the existing schema.
2. It appears on the home cluster, sitemap, and `llms.txt`.
3. Do not invent fees or dollars. If the official PDF is not in hand, leave it queued in `lib/tables.js` `QUEUED`.
