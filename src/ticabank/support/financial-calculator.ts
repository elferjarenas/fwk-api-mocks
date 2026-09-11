export interface TermRate {
  term: number;
  weight: number;
}

export interface TermRatesConfig {
  termRates: TermRate[];
  totalPercent: number;
}

/**
 * Get term rates configuration based on loan amount
 * Different configurations for amounts > 1500 vs <= 1500
 * 
 * @param amount - Loan amount
 * @returns Term rates and total interest percentage
 */
export function getTermRatesConfig(amount: number): TermRatesConfig {
  if (amount > 1500) {
    return {
      termRates: [
        { term: 6, weight: 15.5 },
        { term: 9, weight: 13.5 },
        { term: 12, weight: 11.5 },
        { term: 15, weight: 9.5 },
        { term: 18, weight: 6.5 },
        { term: 24, weight: 4.5 },
      ],
      totalPercent: 61.0,
    };
  } else {
    return {
      termRates: [
        { term: 6, weight: 12.5 },
        { term: 9, weight: 10.5 },
        { term: 12, weight: 9.5 },
        { term: 15, weight: 7.5 },
        { term: 18, weight: 5.5 },
      ],
      totalPercent: 45.5,
    };
  }
}

/**
 * Calculate payment day boost factor
 * Certain payment days get a small boost to the installment amount
 * 
 * - Day 15: +1% boost
 * - Day 22: +2% boost
 * - Other days: 0% boost
 * 
 * @param paymentDay - Day of the month (1-31)
 * @returns Boost multiplier (1.0 = no boost, 1.01 = 1% boost, 1.02 = 2% boost)
 */
export function calculatePaymentDayBoost(paymentDay: number | undefined): number {
  if (!paymentDay) {
    return 1.0;
  }

  switch (paymentDay) {
    case 15:
      return 1.01; // 1% boost
    case 22:
      return 1.02; // 2% boost
    default:
      return 1.0; // No boost
  }
}

/**
 * Calculate installment amount for a specific term
 * 
 * Formula:
 * 1. Calculate total interest for this term based on allocated percentage
 * 2. Distribute interest evenly across installments
 * 3. Calculate principal per installment
 * 4. Add interest + principal
 * 5. Apply payment day boost
 * 6. Round to 1 decimal place
 * 
 * @param amount - Loan amount
 * @param term - Number of installments
 * @param allocatedPercent - Interest percentage allocated to this term
 * @param paymentDayBoost - Boost multiplier (1.0 = no boost)
 * @returns Monthly installment amount
 */
export function calculateInstallmentAmount(
  amount: number,
  term: number,
  allocatedPercent: number,
  paymentDayBoost: number
): number {
  const interestForTerm = amount * (allocatedPercent / 100.0);
  const interestPerInstallment = interestForTerm / term;
  const principalPerInstallment = amount / term;
  const baseInstallment = principalPerInstallment + interestPerInstallment;
  const installmentAmount = baseInstallment * paymentDayBoost;

  return Math.round(installmentAmount * 10) / 10;
}

/**
 * Distribute interest percentage across terms based on weights
 * 
 * @param termRates - Array of term rates with weights
 * @param totalPercent - Total interest percentage to distribute
 * @returns Map of term -> allocated percentage
 */
export function distributeInterestByWeight(
  termRates: TermRate[],
  totalPercent: number
): Map<number, number> {
  const sumWeights = termRates.reduce((sum, tr) => sum + tr.weight, 0);

  const allocatedPercents = new Map<number, number>();
  
  termRates.forEach((tr) => {
    const allocatedPercent = (tr.weight / sumWeights) * totalPercent;
    allocatedPercents.set(tr.term, allocatedPercent);
  });
  
  return allocatedPercents;
}

// ============================================================================
// QUOTE-SPECIFIC CALCULATIONS
// ============================================================================

/**
 * Calculate interest rate percentage for a specific term and amount
 * 
 * Formula:
 * interest_rate_percentage = (current_term_rate.weight / sum_weights) * total_percent
 * 
 * @param amount - Loan amount
 * @param term - Number of installments (6-24)
 * @returns Interest rate percentage for the term
 */
export function calculateInterestRatePercentage(amount: number, term: number): number {
  const config = getTermRatesConfig(amount);
  const termRate = config.termRates.find((tr) => tr.term === term);
  
  if (!termRate) {
    const defaultRate = config.termRates[0];
    const sumWeights = config.termRates.reduce((sum, tr) => sum + tr.weight, 0);
    return (defaultRate.weight / sumWeights) * config.totalPercent;
  }
  
  const sumWeights = config.termRates.reduce((sum, tr) => sum + tr.weight, 0);
  return (termRate.weight / sumWeights) * config.totalPercent;
}

/**
 * Calculate credit life insurance (prima de desgravamen)
 * 
 * Fixed rate: 0.45% of loan amount
 * 
 * @param amount - Loan amount
 * @returns Insurance premium (rounded to 2 decimals)
 */
export function calculateCreditLifeInsurance(amount: number): number {
  const rate = 0.45;
  const premium = amount * (rate / 100.0);
  return Math.round(premium * 100) / 100;
}

/**
 * Calculate financial transaction tax (ITF)
 * 
 * Tax rate depends on amount:
 * - amount > 1000: 0.25
 * - amount <= 1000: 0.0
 * 
 * @param amount - Loan amount
 * @returns ITF amount
 */
export function calculateFinancialTransactionTax(amount: number): number {
  return amount > 1000 ? 0.25 : 0.0;
}

/**
 * Calculate effective annual rate (TEA) and effective cost rate (TCEA)
 * 
 * TEA = (((1 + simple_monthly_rate)^12) - 1) * 100
 * TCEA = (((1 + simple_monthly_rate + insurance_rate)^12) - 1) * 100
 * 
 * @param monthlyRate - Simple monthly interest rate (decimal, e.g., 0.0294 for 2.94%)
 * @param insuranceRate - Monthly insurance rate (decimal, e.g., 0.0037 for 0.37%)
 * @returns Object with TEA and TCEA (minimum values: 35.3 and 45.5 respectively)
 */
export function calculateEffectiveRates(
  monthlyRate: number,
  insuranceRate: number
): { tea: number; tcea: number } {
  const teaRaw = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  const tea = Math.max(teaRaw, 35.3);
  
  const tceaRaw = (Math.pow(1 + monthlyRate + insuranceRate, 12) - 1) * 100;
  const tcea = Math.max(tceaRaw, 45.5);
  
  return {
    tea: Math.round(tea * 10) / 10,
    tcea: Math.round(tcea * 10) / 10,
  };
}

/**
 * Calculate first payment date based on base date and payment day
 * 
 * Logic:
 * - If current day < payment day in same month: first payment is payment day this month
 * - If current day >= payment day: first payment is payment day next month
 * 
 * @param baseDate - Reference date (usually current date)
 * @param paymentDay - Day of month for payment (1-31)
 * @returns First payment date
 */
export function calculateFirstPaymentDate(baseDate: Date, paymentDay: number): Date {
  const currentDay = baseDate.getDate();
  const firstPaymentDate = new Date(baseDate);
  
  if (currentDay < paymentDay) {
    firstPaymentDate.setDate(paymentDay);
  } else {
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
    firstPaymentDate.setDate(paymentDay);
  }
  
  return firstPaymentDate;
}

/**
 * Calculate simulated installment amount for Quote
 * Similar to Simulate but used for Quote calculation
 * 
 * @param amount - Loan amount
 * @param term - Number of installments
 * @param interestRatePercentage - Interest rate percentage for this term
 * @returns Monthly installment amount
 */
export function calculateSimulatedInstallment(
  amount: number,
  term: number,
  interestRatePercentage: number
): number {
  const totalInterest = amount * (interestRatePercentage / 100.0);
  const interestPerInstallment = totalInterest / term;
  const principalPerInstallment = amount / term;
  const installment = principalPerInstallment + interestPerInstallment;
  
  return Math.round(installment * 10) / 10;
}
