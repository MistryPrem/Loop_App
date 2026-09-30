import notifee, { AndroidImportance, TriggerType, RepeatFrequency } from '@notifee/react-native';

const MEDICINE_CHANNEL_ID = 'loop_medicine_reminders';

export async function setupNotificationChannels(): Promise<void> {
  await notifee.createChannel({
    id: MEDICINE_CHANNEL_ID,
    name: 'Medicine & Routine Reminders',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default'
  });
}

export async function scheduleMedicineReminder(
  id: string,
  medicineTitle: string,
  dosage: string,
  scheduledTime: Date
): Promise<void> {
  await setupNotificationChannels();

  // Schedule notification trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: scheduledTime.getTime(),
    repeatFrequency: RepeatFrequency.DAILY
  };

  await notifee.createTriggerNotification(
    {
      id,
      title: `Time to take: ${medicineTitle}`,
      body: `Dosage: ${dosage}. Tap to open Loop and confirm.`,
      android: {
        channelId: MEDICINE_CHANNEL_ID,
        pressAction: {
          id: 'default'
        }
      }
    },
    // @ts-ignore
    trigger
  );
}

export async function cancelMedicineReminder(id: string): Promise<void> {
  await notifee.cancelNotification(id);
}
