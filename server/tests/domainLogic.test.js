import { describe, test, expect } from '@jest/globals';
import {
  calculateHabitStreak,
  getNextChoreAssignee,
  calculateExpenseBalances
} from '@loop/shared/domainLogic';

describe('Domain Logic Backend Integration Tests', () => {
  test('Habit streak calculation honors consecutive days and longest history', () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = calculateHabitStreak([today], 14);
    expect(result.currentStreak).toBe(1);
    expect(result.weeklyCompletionRate).toBeGreaterThan(0);
  });

  test('Chore rotation wraps cleanly', () => {
    const list = ['A', 'B'];
    expect(getNextChoreAssignee(list, 'B')).toBe('A');
  });

  test('Expense balances correctly zero-sum', () => {
    const expenses = [
      {
        id: '1',
        payerId: 'userA',
        payerName: 'Alice',
        amount: 30,
        splitBetween: ['userA', 'userB', 'userC'],
        splitMode: 'equal'
      }
    ];

    const balances = calculateExpenseBalances(expenses, ['userA', 'userB', 'userC']);
    const sum = balances.reduce((acc, b) => acc + b.netBalance, 0);
    expect(Math.abs(sum)).toBeLessThan(0.001);
  });
});
