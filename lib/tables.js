'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const CLUSTERS = [
  {
    id: 'money',
    label: 'Money',
    dek: 'IRS-year joins: deferrals, calendars, who gets which form.',
  },
  {
    id: 'local',
    label: 'Local NC / FL',
    dek: 'County fees, snowbird tags, liens — PDFs compiled, not guessed.',
  },
  {
    id: 'jobsite',
    label: 'Jobsite',
    dek: 'Code-year matrices for work in the field, not exam prep.',
  },
];

const QUEUED = [
  { slug: 'llc-annual-reports', cluster: 'money', title: 'LLC annual report due dates (50-state)' },
  { slug: 'economic-nexus', cluster: 'money', title: 'Economic nexus thresholds by state' },
  { slug: 'nc-fl-permit-fees', cluster: 'local', title: 'NC / FL county permit fees' },
  { slug: 'snowbird-title-tag', cluster: 'local', title: 'NC vs FL title and tag (snowbird)' },
  { slug: 'mechanics-lien-nc-fl', cluster: 'local', title: 'Mechanic’s lien deadlines, NC / FL' },
  { slug: 'property-tax-calendar', cluster: 'local', title: 'Property-tax calendar + appeals' },
  { slug: 'permit-exemptions-nc-fl', cluster: 'local', title: 'Shed / fence / ADU without a permit' },
  { slug: 'small-claims-limits', cluster: 'money', title: 'Small-claims dollar caps by state' },
  { slug: 'ampacity', cluster: 'jobsite', title: 'AWG ampacity + breaker pairing' },
];

function loadAll() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  return files
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8')))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function bySlug(slug) {
  return loadAll().find((t) => t.slug === slug) || null;
}

function liveInCluster(id) {
  return loadAll().filter((t) => t.cluster === id);
}

function queuedInCluster(id) {
  return QUEUED.filter((t) => t.cluster === id);
}

function usd(n) {
  return `$${Number(n).toLocaleString('en-US')}`;
}

function formatCell(value, format) {
  if (value == null) return '';
  if (format === 'usd') return usd(value);
  return String(value);
}

function toMarkdown(table) {
  const lines = [
    `# ${table.title}`,
    '',
    `As of ${table.asOf}. ${table.extract}`,
    '',
  ];
  for (const block of table.tables) {
    lines.push(`## ${block.caption}`, '');
    const header = block.columns.map((c) => c.label).join(' | ');
    const align = block.columns
      .map((c) => (c.format === 'usd' ? '---:' : '---'))
      .join(' | ');
    lines.push(`| ${header} |`, `| ${align} |`);
    for (const row of block.rows) {
      const cells = block.columns.map((c) => formatCell(row[c.key], c.format).replace(/\|/g, '\\|'));
      lines.push(`| ${cells.join(' | ')} |`);
    }
    lines.push('');
  }
  lines.push('## Sources', '');
  for (const s of table.sources) {
    lines.push(`- [${s.title}](${s.url})`);
  }
  lines.push('');
  return lines.join('\n');
}

function toJson(table) {
  return {
    asOf: table.asOf,
    taxYear: table.taxYear,
    path: `/tables/${table.slug}`,
    title: table.title,
    extract: table.extract,
    compiledBy: { person: 'Kevin Dunn', organization: 'Cite Hubs' },
    sources: table.sources,
    tables: table.tables,
  };
}

module.exports = {
  CLUSTERS,
  QUEUED,
  loadAll,
  bySlug,
  liveInCluster,
  queuedInCluster,
  formatCell,
  toMarkdown,
  toJson,
};
