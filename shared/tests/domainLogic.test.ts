import { describe, test, expect } from '@jest/globals';
import {
  calculateHabitStreak,
  getNextChoreAssignee,
  calculateExpenseBalances
} from '../src/domainLogic.js';

describe('Shared Domain Logic Unit Tests', () => {
  describe('calculateHabitStreak', () => {
    test('calculates correct current streak, longest streak, and completion rate', () => {
      const today = new Date().toISOString().slice(0, 10);
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().slice(0, 10);

      const checkInDates = [today, yesterday, '2026-09-20', '2026-09-19', '2026-09-18'];
      const result = calculateHabitStreak(checkInDates, 14);

      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(3); // 20, 19, 18
      expect(result.gridDays).toHaveLength(14);
      expect(result.screenReaderSummary).toContain('days completed this fortnight');
    });

    test('returns 0 streak when no check-ins exist', () => {
      const result = calculateHabitStreak([], 14);
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.weeklyCompletionRate).toBe(0);
    });
  });

  describe('getNextChoreAssignee', () => {
    const members = ['user-alex', 'user-sam', 'user-jordan'];

    test('rotates to next member in array', () => {
      expect(getNextChoreAssignee(members, 'user-alex')).toBe('user-sam');
      expect(getNextChoreAssignee(members, 'user-sam')).toBe('user-jordan');
    });

    test('wraps around to the first member at the end of the rotation list', () => {
      expect(getNextChoreAssignee(members, 'user-jordan')).toBe('user-alex');
    });

    test('picks first member if current assignee is empty or invalid', () => {
      expect(getNextChoreAssignee(members, undefined)).toBe('user-alex');
      expect(getNextChoreAssignee(members, 'unknown-user')).toBe('user-alex');
    });
  });

  describe('calculateExpenseBalances', () => {
    const allMembers = ['user-1', 'user-2', 'user-3'];

    test('calculates net balances for equal split', () => {
      // Alex (user-1) spends $60 split equally among all 3 ($20 each)
      const expenses = [
        {
          id: 'exp-1',
          payerId: 'user-1',
          payerName: 'Alex',
          amount: 60,
          splitBetween: ['user-1', 'user-2', 'user-3'],
          splitMode: 'equal' as const
        }
      ];

      const balances = calculateExpenseBalances(expenses, allMembers);

      const alex = balances.find(b => b.userId === 'user-1');
      const sam = balances.find(b => b.userId === 'user-2');
      const jordan = balances.find(b => b.userId === 'user-3');

      expect(alex?.netBalance).toBe(40); // 60 paid - 20 owed = +40
      expect(sam?.netBalance).toBe(-20);
      expect(jordan?.netBalance).toBe(-20);
    });
  });
});
