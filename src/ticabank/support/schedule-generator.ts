import { ScheduleItem } from '../entities/quote-dto.js';
import { calculateFirstPaymentDate } from './financial-calculator.js';

export interface ScheduleParams {
  amount: number;
  term: number;
  interestRatePercentage: number;
  paymentDay: number;
  baseDate: Date;
}

/**
 * Generate payment schedule (cronograma)
 * 
 * Logic:
 * 1. Calculate monthly capital (principal) amount
 * 2. Calculate total interest for loan
 * 3. Distribute interest evenly across installments
 * 4. Adjust first installment if needed
 * 5. Adjust last installment to balance any rounding differences
 * 6. Calculate due dates for each installment
 * 
 * @param params - Schedule generation parameters
 * @returns Array of schedule items with installment details
 */
export function generateSchedule(params: ScheduleParams): ScheduleItem[] {
  const { amount, term, interestRatePercentage, paymentDay, baseDate } = params;
  const principalPerInstallment = amount / term;
  const totalInterest = amount * (interestRatePercentage / 100.0);
  const interestPerInstallment = totalInterest / term;
  const firstPaymentDate = calculateFirstPaymentDate(baseDate, paymentDay);
  const schedule: ScheduleItem[] = [];

  let accumulatedCapital = 0;
  let accumulatedInterest = 0;
  
  for (let i = 1; i <= term; i++) {
    const dueDate = new Date(firstPaymentDate);
    dueDate.setMonth(firstPaymentDate.getMonth() + (i - 1));

    let capital: number;
    let interest: number;
    
    if (i === term) {
      capital = amount - accumulatedCapital;
      interest = totalInterest - accumulatedInterest;
    } else {
      capital = principalPerInstallment;
      interest = interestPerInstallment;
    }

    capital = Math.round(capital * 100) / 100;
    interest = Math.round(interest * 100) / 100;

    accumulatedCapital += capital;
    accumulatedInterest += interest;

    const dueDateString = dueDate.toISOString().split('T')[0];

    schedule.push({
      numeroCuota: i,
      montoCapital: capital,
      montoInteres: interest,
      fechaVencimientoCuota: dueDateString,
    });
  }
  
  return schedule;
}

/**
 * Calculate last payment date (maturity date)
 * 
 * @param baseDate - Reference date (usually current date)
 * @param paymentDay - Day of month for payment (1-31)
 * @param term - Number of installments
 * @returns Last payment date
 */
export function calculateMaturityDate(
  baseDate: Date,
  paymentDay: number,
  term: number
): string {
  const firstPaymentDate = calculateFirstPaymentDate(baseDate, paymentDay);
  const maturityDate = new Date(firstPaymentDate);

  maturityDate.setMonth(firstPaymentDate.getMonth() + (term - 1));

  return maturityDate.toISOString().split('T')[0];
}
