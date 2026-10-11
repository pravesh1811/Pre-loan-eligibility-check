import { describe, expect, it, vi } from 'vitest';
import { evaluateEligibility, generateBureauScore } from './policyEngine';
const base = { age: 30, monthlySalary: 50000, existingEmis: 0, requestedAmount: 300000, tenure: 36 };
describe('Phase 1 loan policy', () => {
  it('rejects low scores with priority over other failures', () => { expect(evaluateEligibility({ ...base, age: 18 }, 599).reason).toBe('Low Bureau Score'); });
  it.each([20, 59])('rejects age %i', age => { expect(evaluateEligibility({ ...base, age }, 600).reason).toBe('Age criteria not met'); });
  it.each([21, 58])('accepts boundary age %i', age => { expect(evaluateEligibility({ ...base, age }, 600).status).toBe('Eligible'); });
  it('enforces the minimum salary', () => { expect(evaluateEligibility({ ...base, monthlySalary: 24999 }, 600).reason).toBe('Minimum salary 25k required'); expect(evaluateEligibility({ ...base, monthlySalary: 25000 }, 600).status).toBe('Eligible'); });
  it('uses 50% FOIR at 50k and 60% above it', () => { expect(evaluateEligibility(base, 700).foir).toBe(.5); expect(evaluateEligibility({ ...base, monthlySalary: 50001 }, 700).foir).toBe(.6); });
  it.each([25000, 26000])('rejects exhausted EMI capacity %i', existingEmis => { expect(evaluateEligibility({ ...base, existingEmis }, 700).status).toBe('Hard Reject'); });
  it('uses self-declared EMIs and gives a lower amount when needed', () => { const result = evaluateEligibility({ ...base, existingEmis: 10000, requestedAmount: 500000 }, 700); expect(result.maxEligibleAmount).toBe(486000); expect(result.reason).toBe('Approved with a lower amount'); expect(result.status).toBe('Eligible'); });
  it('approves a request equal to the maximum', () => { expect(evaluateEligibility({ ...base, requestedAmount: 810000 }, 700).reason).toBe('Approved for your requested amount'); });
  it('generates both inclusive score endpoints', () => { const random = vi.spyOn(Math, 'random'); random.mockReturnValue(0); expect(generateBureauScore()).toBe(300); random.mockReturnValue(.999999); expect(generateBureauScore()).toBe(900); random.mockRestore(); });
});
