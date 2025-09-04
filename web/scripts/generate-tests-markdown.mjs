import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORTS_DIR = path.join(ROOT, 'reports')
const VITEST_JSON = path.join(REPORTS_DIR, 'vitest.json')
const MD_OUT = path.join(REPORTS_DIR, 'tests-report.md')

function readJSON(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function formatDuration(ms) {
  if (typeof ms !== 'number') return '-'
  if (ms < 1000) return `${ms} ms`
  const s = (ms / 1000).toFixed(2)
  return `${s} s`
}

function buildStatusSummary(vitest) {
  let total = 0
  let passed = 0
  let failed = 0
  let skipped = 0
  let duration = 0

  if (!vitest) return { total, passed, failed, skipped, duration }

  const testResults = Array.isArray(vitest.testResults) ? vitest.testResults : []
  for (const suite of testResults) {
    const tests = suite.assertionResults || []
    for (const t of tests) {
      total += 1
      duration += Number(t.duration || 0)
      if (t.status === 'passed') passed += 1
      else if (t.status === 'failed') failed += 1
      else if (t.status === 'skipped' || t.status === 'pending' || t.status === 'todo') skipped += 1
    }
  }

  if (total === 0 && Array.isArray(vitest.results)) {
    for (const s of vitest.results) {
      const tests = s.tests || []
      for (const t of tests) {
        total += 1
        duration += Number(t.duration || 0)
        if (t.state === 'pass') passed += 1
        else if (t.state === 'fail') failed += 1
        else if (t.state === 'skip' || t.state === 'todo') skipped += 1
      }
    }
  }

  return { total, passed, failed, skipped, duration }
}

function buildSuites(vitest) {
  const suites = []

  if (vitest && Array.isArray(vitest.testResults)) {
    for (const s of vitest.testResults) {
      const file = s.name || s.file || s.testFilePath
      const assertions = s.assertionResults || []
      suites.push({
        file,
        tests: assertions.map(a => ({
          title: a.title || a.fullName || a.ancestorTitles?.concat([a.title]).join(' > ') || 'test',
          status: a.status || a.state,
          duration: a.duration ?? null,
          failureMessages: a.failureMessages || [],
        })),
      })
    }
    if (suites.length > 0) return suites
  }

  if (vitest && Array.isArray(vitest.results)) {
    for (const s of vitest.results) {
      suites.push({
        file: s.file || s.name,
        tests: (s.tests || []).map(t => ({
          title: t.name,
          status: t.state,
          duration: t.duration ?? null,
          failureMessages: t.error ? [String(t.error?.message || t.error)] : [],
        })),
      })
    }
  }

  return suites
}

function relativeFile(p) {
  if (!p) return '(arquivo não disponível)'
  try {
    return path.relative(ROOT, p)
  } catch {
    return String(p)
  }
}

function generateMarkdown(vitest) {
  const summary = buildStatusSummary(vitest)
  const suites = buildSuites(vitest)
  const now = new Date().toISOString().replace('T', ' ').replace('Z', '')

  const md = []
  md.push(`# Relatório de Testes - cupcakes-web`)
  md.push('')
  md.push(`Gerado em: ${now}`)
  md.push('')
  md.push(`Resumo:`)
  md.push(`- Total: ${summary.total}`)
  md.push(`- Passaram: ${summary.passed}`)
  md.push(`- Falharam: ${summary.failed}`)
  md.push(`- Ignorados: ${summary.skipped}`)
  md.push(`- Duração total: ${formatDuration(summary.duration)}`)
  md.push('')

  md.push(`## Suites e Casos`)
  if (suites.length === 0) {
    md.push('_Nenhuma suite encontrada no JSON do Vitest._')
  } else {
    for (const s of suites) {
      md.push(`### ${relativeFile(s.file)}`)
      if (!s.tests?.length) {
        md.push('- (sem casos detectados)')
      } else {
        for (const t of s.tests) {
          const statusIcon = t.status === 'passed' ? '✅' : t.status === 'failed' ? '❌' : '⚪'
          md.push(`- ${statusIcon} ${t.title} (${t.status || '-'}, ${formatDuration(t.duration)})`)
          if (t.failureMessages?.length) {
            md.push(`  - Falhas:`)
            for (const fm of t.failureMessages) {
              const oneLine = String(fm).replace(/\r?\n/g, ' ')
              md.push(`    - ${oneLine}`)
            }
          }
        }
      }
      md.push('')
    }
  }

  return md.join('\n')
}

function main() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true })
  const data = readJSON(VITEST_JSON)
  if (!data) {
    console.error(`Arquivo não encontrado ou inválido: ${path.relative(ROOT, VITEST_JSON)}. Rode "npm run test:json" antes.`)
    process.exit(1)
  }
  const md = generateMarkdown(data)
  fs.writeFileSync(MD_OUT, md, 'utf8')
  console.log(`Markdown gerado em: ${path.relative(ROOT, MD_OUT)}`)
}

main()
