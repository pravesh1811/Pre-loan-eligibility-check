export interface LoanInput { age: number; monthlySalary: number; existingEmis: number; requestedAmount: number; tenure: number }
export interface EligibilityResult { bureauScore: number; status: 'Eligible' | 'Hard Reject'; maxEligibleAmount: number; reason: string; foir: number; availableEmi: number }
export function generateBureauScore(): number { return Math.floor(Math.random() * 601) + 300; }
export function evaluateEligibility(input: LoanInput, bureauScore = generateBureauScore()): EligibilityResult {
  const { age, monthlySalary, existingEmis, requestedAmount, tenure } = input;
  const foir = monthlySalary > 50000 ? 0.6 : 0.5;
  const availableEmi = monthlySalary * foir - existingEmis;
  const reject = (reason: string): EligibilityResult => ({ bureauScore, status: 'Hard Reject', maxEligibleAmount: 0, reason, foir, availableEmi });
  if (bureauScore < 600) return reject('Low Bureau Score');
  if (age < 21 || age > 58) return reject('Age criteria not met');
  if (monthlySalary < 25000) return reject('Minimum salary 25k required');
  if (availableEmi <= 0) return reject('No available EMI capacity');
  const maxEligibleAmount = Math.floor(availableEmi * tenure * 0.9);
  return { bureauScore, status: 'Eligible', maxEligibleAmount, reason: requestedAmount <= maxEligibleAmount ? 'Approved for your requested amount' : 'Approved with a lower amount', foir, availableEmi };
}
