import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  AccessibilityInfo
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { getSocket } from '../services/socket';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

interface DoseItem {
  id: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  dueTime: string;
  status: 'taken' | 'due' | 'missed';
  lastTakenTime?: string;
}

export const CaregiverMedicineScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, scaleSize } = useAccessibility();

  const [doses, setDoses] = useState<DoseItem[]>([
    {
      id: 'dose-1',
      patientName: 'Mom (Eleanor)',
      medicineName: 'Amlodipine',
      dosage: '5mg',
      dueTime: '08:00 AM',
      status: 'due'
    },
    {
      id: 'dose-2',
      patientName: 'Mom (Eleanor)',
      medicineName: 'Metformin',
      dosage: '500mg',
      dueTime: '12:00 PM',
      status: 'due'
    },
    {
      id: 'dose-3',
      patientName: 'Mom (Eleanor)',
      medicineName: 'Atorvastatin',
      dosage: '20mg',
      dueTime: 'Yesterday 09:00 PM',
      status: 'taken',
      lastTakenTime: '09:05 PM'
    }
  ]);

  const [nudgeStatus, setNudgeStatus] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for live checkins from patient
    const onNewCheckin = (payload: any) => {
      setDoses((prev) =>
        prev.map((d) => (d.id === payload.itemId ? { ...d, status: payload.status } : d))
      );
      AccessibilityInfo.announceForAccessibility(
        `Update: ${payload.userName} marked ${payload.itemTitle} as ${payload.status}.`
      );
    };

    socket.on(SOCKET_EVENTS.SERVER_CHECKIN_NEW, onNewCheckin);

    return () => {
      socket.off(SOCKET_EVENTS.SERVER_CHECKIN_NEW, onNewCheckin);
    };
  }, []);

  const handleSendNudge = (item: DoseItem) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CLIENT_NUDGE_SEND, {
        loopId: 'loop-family-med',
        toUserId: 'user-patient-1',
        itemId: item.id,
        message: `Friendly reminder from caregiver: Time for your ${item.medicineName} (${item.dosage})!`
      });
    }

    setNudgeStatus(`Sent gentle reminder for ${item.medicineName}`);
    AccessibilityInfo.announceForAccessibility(`Nudge sent for ${item.medicineName}`);
    setTimeout(() => setNudgeStatus(null), 4000);
  };

  const renderDoseCard = ({ item }: { item: DoseItem }) => {
    let statusBg = colors.warningBg;
    let statusText = colors.warningText;
    let statusLabel = '⏰ Due';

    if (item.status === 'taken') {
      statusBg = colors.successBg;
      statusText = colors.successText;
      statusLabel = '✓ Taken';
    } else if (item.status === 'missed') {
      statusBg = colors.dangerBg;
      statusText = colors.dangerText;
      statusLabel = '⚠️ Missed';
    }

    return (
      <View
        accessible={true}
        accessibilityRole="summary"
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.topRow}>
          <Text style={[styles.patientTag, { color: colors.primary, fontSize: scaleSize(16) }]}>
            {item.patientName}
          </Text>

          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusText, fontSize: scaleSize(16) }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={[styles.medName, { color: colors.textPrimary, fontSize: scaleSize(22) }]}>
          {item.medicineName}
        </Text>

        <Text style={[styles.details, { color: colors.textSecondary, fontSize: scaleSize(18) }]}>
          Dose: {item.dosage} • Time: {item.dueTime}
        </Text>

        {item.status === 'due' && (
          <TouchableOpacity
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Send friendly reminder to ${item.patientName} for ${item.medicineName}`}
            onPress={() => handleSendNudge(item)}
            style={[styles.nudgeBtn, { backgroundColor: colors.primary, minHeight: scaleSize(48) }]}
          >
            <Text style={[styles.nudgeBtnText, { color: colors.primaryText, fontSize: scaleSize(18) }]}>
              👋 Send Friendly Nudge
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {nudgeStatus && (
        <View
          accessible={true}
          accessibilityRole="alert"
          style={[styles.nudgeAlert, { backgroundColor: colors.infoBg, borderColor: colors.info }]}
        >
          <Text style={[styles.nudgeAlertText, { color: colors.infoText, fontSize: scaleSize(16) }]}>
            ✓ {nudgeStatus}
          </Text>
        </View>
      )}

      <FlatList
        data={doses}
        keyExtractor={(item) => item.id}
        renderItem={renderDoseCard}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  listContent: {
    padding: 16
  },
  nudgeAlert: {
    padding: 14,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2
  },
  nudgeAlertText: {
    fontWeight: '700',
    textAlign: 'center'
  },
  card: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    marginBottom: 16,
    elevation: 3
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  patientTag: {
    fontWeight: '700'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    fontWeight: '700'
  },
  medName: {
    fontWeight: '800',
    marginBottom: 6
  },
  details: {
    marginBottom: 16
  },
  nudgeBtn: {
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  nudgeBtnText: {
    fontWeight: '700'
  }
});
