import { describe, expect, it } from 'vitest'
import { analyzeLogTimeline, analyzeLogTimelineDetailed } from '../parser'
import type { RuleItem, SxFyRuleItem } from '../types'
import {
  MULTI_DIALECT_LOG,
  STANDALONE_S2F41
} from '../../secs-log/__tests__/fixtures'

const ceidRules: RuleItem[] = [
  { ceid: '5', desc: 'Process state changed', color: '#f00' }
]

const sxfyRules: SxFyRuleItem[] = [
  { id: 's2f41-command', s: 2, f: 41, keyPos: '[0][0]', desc: 'RCMD', color: '#0f0' },
  { id: 's6f11-presence', s: 6, f: 11, desc: 'Event report', color: '#00f' }
]

describe('SECS log timeline analysis', () => {
  it('extracts CEID and configured paths across mixed log dialects', () => {
    const result = analyzeLogTimeline(MULTI_DIALECT_LOG, ceidRules, sxfyRules)

    expect(result.filter(item => item.type === 'CEID')).toHaveLength(2)
    expect(result).toContainEqual(expect.objectContaining({
      time: '01:14:32.796', sxFy: 'S6F11', ceid: '5', desc: 'Process state changed'
    }))
    expect(result).toContainEqual(expect.objectContaining({
      time: '01:14:33.123', sxFy: 'S2F41', desc: 'RCMD: START', ruleId: 's2f41-command'
    }))
  })

  it('keeps standalone SML events with an empty time', () => {
    const result = analyzeLogTimeline(STANDALONE_S2F41, [], sxfyRules)

    expect(result).toEqual([
      expect.objectContaining({ time: '', sxFy: 'S2F41', desc: 'RCMD: START' })
    ])
  })

  it('ignores disabled rules', () => {
    const result = analyzeLogTimeline(STANDALONE_S2F41, [], [
      { ...sxfyRules[0]!, enabled: false }
    ])

    expect(result).toEqual([])
  })

  it('does not parse message bodies for presence-only SxFy rules', () => {
    const source = `01:00:00 SEND S7F20
S7F20
<L,1
  <A 'RECIPE'>`
    const presenceRule: SxFyRuleItem = {
      id: 's7f20-presence', s: 7, f: 20, desc: 'RecipeList', color: '#00f'
    }

    const result = analyzeLogTimelineDetailed(source, [], [presenceRule])

    expect(result.timeline).toEqual([
      expect.objectContaining({ sxFy: 'S7F20', desc: 'RecipeList', ruleId: 's7f20-presence' })
    ])
    expect(result.diagnostics).toEqual([])
  })

  it('still parses message bodies when an SxFy rule reads a configured path', () => {
    const source = `01:00:00 SEND S7F20
S7F20
<L,1
  <A 'RECIPE'>`
    const valueRule: SxFyRuleItem = {
      id: 's7f20-value', s: 7, f: 20, keyPos: '[0][0]', desc: 'Recipe', color: '#00f'
    }

    const result = analyzeLogTimelineDetailed(source, [], [valueRule])

    expect(result.timeline).toEqual([])
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      sfName: 'S7F20', code: 'unclosed-list', severity: 'error'
    }))
  })

  it('returns message-level SML diagnostics without emitting values from unusable trees', () => {
    const source = `01:00:00 SEND S6F11
S6F11
<L,2
  <U4 1>`
    const result = analyzeLogTimelineDetailed(source, ceidRules, sxfyRules)

    expect(result.messageCount).toBe(1)
    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      sfName: 'S6F11', code: 'unclosed-list', severity: 'error', line: 3
    }))
    expect(result.timeline).toEqual([
      expect.objectContaining({ sxFy: 'S6F11', type: 'SxFy', line: 1 })
    ])
  })
})
