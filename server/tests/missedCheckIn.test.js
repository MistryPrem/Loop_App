import { jest, describe, test, expect } from '@jest/globals';
import { scanForMissedCheckins } from '../src/jobs/missedCheckInJob.js';
import { LoopItem } from '../src/models/LoopItem.js';
import { CheckIn } from '../src/models/CheckIn.js';
import { User } from '../src/models/User.js';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

describe('BullMQ Missed Check-in Job Logic', () => {
  test('flags overdue item as missed and emits member:missed event', async () => {
    // 1. Mock overdue item (scheduled 08:00 today, deadline 60 mins -> overdue at current time)
    const mockLoopId = '64b0f0000000000000000010';
    const mockItemId = '64b0f0000000000000000020';
    const mockMemberId = '64b0f0000000000000000001';

    const mockItem = {
      _id: mockItemId,
      title: 'Morning Heart Medication',
      isActive: true,
      loopId: {
        _id: mockLoopId,
        members: [{ userId: mockMemberId, role: 'patient' }]
      },
      schedule: {
        timesOfDay: ['08:00'],
        deadlineMinutesAfterDue: 30
      }
    };

    // Spy on Mongoose models
    const findSpy = jest.spyOn(LoopItem, 'find').mockReturnValue({
      populate: jest.fn().mockResolvedValue([mockItem])
    });

    const checkInFindSpy = jest.spyOn(CheckIn, 'findOne').mockResolvedValue(null); // No check-in recorded yet
    const checkInCreateSpy = jest.spyOn(CheckIn, 'create').mockImplementation((doc) => Promise.resolve({
      ...doc,
      _id: '64b0f0000000000000000999'
    }));

    const userFindSpy = jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({ name: 'Grandma Rose' })
    });

    // Mock socket io namespace
    const emittedEvents = [];
    const mockNamespace = {
      to: (room) => ({
        emit: (event, payload) => {
          emittedEvents.push({ room, event, payload });
        }
      })
    };

    const result = await scanForMissedCheckins(mockNamespace);

    expect(result.missedCount).toBe(1);
    expect(checkInCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        loopId: mockLoopId,
        itemId: mockItemId,
        userId: mockMemberId,
        status: 'missed'
      })
    );

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0].event).toBe(SOCKET_EVENTS.SERVER_MEMBER_MISSED);
    expect(emittedEvents[0].payload.userName).toBe('Grandma Rose');
    expect(emittedEvents[0].payload.itemTitle).toBe('Morning Heart Medication');

    // Clean up spies
    findSpy.mockRestore();
    checkInFindSpy.mockRestore();
    checkInCreateSpy.mockRestore();
    userFindSpy.mockRestore();
  });
});
