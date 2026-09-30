/**
 * Domain calculation logic for Habit Streaks, Chore Rotations, and Expense Splits
 */

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
  weeklyCompletionRate: number; // 0 to 100 percentage
  gridDays: {
    date: string; // YYYY-MM-DD
    completed: boolean;
    dayOfWeek: string;
  }[];
  screenReaderSummary: string;
}

/**
 * Calculates habit streak statistics and builds glanceable grid data.
 * @param checkInDates Array of ISO strings or YYYY-MM-DD dates where habit was marked 'done'
 * @param totalDaysToInspect Number of past days to inspect (defaults to 14 days / fortnight)
 */
export function calculateHabitStreak(checkInDates: string[], totalDaysToInspect: number = 14): HabitStreakResult {
  const completedDateSet = new Set(
    checkInDates.map(d => d.slice(0, 10))
  );

  const gridDays: HabitStreakResult['gridDays'] = [];
  const today = new Date();
  let completedCount = 0;

  for (let i = totalDaysToInspect - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isCompleted = completedDateSet.has(dateStr);

    if (isCompleted) completedCount++;

    gridDays.push({
      date: dateStr,
      completed: isCompleted,
      dayOfWeek
    });
  }

  // Calculate current streak backwards from today or yesterday
  let currentStreak = 0;
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let checkDate = completedDateSet.has(todayStr) ? today : (completedDateSet.has(yesterdayStr) ? yesterday : null);

  if (checkDate) {
    let cur = new Date(checkDate);
    while (true) {
      const curStr = cur.toISOString().slice(0, 10);
      if (completedDateSet.has(curStr)) {
        currentStreak++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across entire sorted history
  const sortedUniqueDates = Array.from(completedDateSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedUniqueDates) {
    const curDate = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = curDate;
  }

  const weeklyCompletionRate = Math.round((completedCount / totalDaysToInspect) * 100);
  const screenReaderSummary = `${completedCount} of ${totalDaysToInspect} days completed this fortnight. Current streak: ${currentStreak} days. Longest streak: ${longestStreak} days.`;

  return {
    currentStreak,
    longestStreak,
    weeklyCompletionRate,
    gridDays,
    screenReaderSummary
  };
}

/**
 * Chore Rotation: selects the next assignee in a round-robin order
 */
export function getNextChoreAssignee(memberIds: string[], currentAssigneeId?: string): string {
  if (memberIds.length === 0) return '';
  if (!currentAssigneeId) return memberIds[0];

  const currentIndex = memberIds.indexOf(currentAssigneeId);
  if (currentIndex === -1 || currentIndex === memberIds.length - 1) {
    return memberIds[0];
  }
  return memberIds[currentIndex + 1];
}

/**
 * Expense Balance Calculation
 */
export interface ExpenseEntry {
  id: string;
  payerId: string;
  payerName: string;
  amount: number;
  splitBetween: string[]; // User IDs
  splitMode: 'equal' | 'percentage' | 'exact';
  customSplits?: Record<string, number>;
}

export interface MemberBalance {
  userId: string;
  netBalance: number; // Positive = owed money, Negative = owes money
}

export function calculateExpenseBalances(expenses: ExpenseEntry[], allMemberIds: string[]): MemberBalance[] {
  const balances: Record<string, number> = {};
  for (const id of allMemberIds) {
    balances[id] = 0;
  }

  for (const exp of expenses) {
    const payer = exp.payerId;
    const amount = exp.amount;
    const splitCount = exp.splitBetween.length;

    if (splitCount === 0) continue;

    // Credit payer
    balances[payer] = (balances[payer] || 0) + amount;

    // Debit debtors
    if (exp.splitMode === 'equal') {
      const splitAmount = amount / splitCount;
      for (const debtor of exp.splitBetween) {
        balances[debtor] = (balances[debtor] || 0) - splitAmount;
      }
    } else if (exp.splitMode === 'exact' && exp.customSplits) {
      for (const [debtor, owed] of Object.entries(exp.customSplits)) {
        balances[debtor] = (balances[debtor] || 0) - owed;
      }
    }
  }

  return Object.entries(balances).map(([userId, netBalance]) => ({
    userId,
    netBalance: Math.round(netBalance * 100) / 100
  }));
}
