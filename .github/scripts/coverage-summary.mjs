import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import process from 'node:process'

const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'))
const { statements, branches, functions, lines } = summary.total

const pct = statements.pct

function badgeColor(value) {
  if (value >= 90) return 'brightgreen'
  if (value >= 75) return 'yellow'
  return 'red'
}

const color = badgeColor(pct)

mkdirSync('badges', { recursive: true })
writeFileSync(
  'badges/coverage.json',
  JSON.stringify({ schemaVersion: 1, label: 'coverage', message: `${pct}%`, color })
)

const table = [
  '## Cobertura de testes',
  '',
  '| Métrica | % |',
  '|---|---|',
  `| Statements | ${statements.pct}% |`,
  `| Branches | ${branches.pct}% |`,
  `| Functions | ${functions.pct}% |`,
  `| Lines | ${lines.pct}% |`,
  ''
].join('\n')

appendFileSync(process.env.GITHUB_STEP_SUMMARY, table)
