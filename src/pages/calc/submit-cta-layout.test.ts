import { describe, expect, it } from 'vitest'
import { SUBMIT_CTA_BAR_CLASS_NAME } from '../CalcPage'

describe('submit CTA layout', () => {
  it('keeps the comparison CTA sticky on mobile but static on desktop', () => {
    expect(SUBMIT_CTA_BAR_CLASS_NAME).toContain('sticky')
    expect(SUBMIT_CTA_BAR_CLASS_NAME).toContain('bottom-0')
    expect(SUBMIT_CTA_BAR_CLASS_NAME).toContain('lg:static')
  })
})
