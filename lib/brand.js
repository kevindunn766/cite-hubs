'use strict';

const NAME = 'Cite Hubs';
const TAGLINE = 'Source-linked tables for money, local rules, and the jobsite.';
const COMPILER = 'Kevin Dunn';
const DISCLAIMER =
  'Compiled from the cited official sources on the as-of date. Not tax, legal, or professional advice. Confirm the source before you file or build.';

function siteUrl() {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  const port = process.env.PORT || 8080;
  return `http://localhost:${port}`;
}

module.exports = {
  NAME,
  TAGLINE,
  COMPILER,
  DISCLAIMER,
  siteUrl,
};
