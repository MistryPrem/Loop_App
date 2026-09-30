import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo
} from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { UndoToast } from '../components/UndoToast';
import { speakMedicineReminder, stopSpeaking } from '../services/tts';
import { getSocket } from '../services/socket';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

interface SimplePatientScreenProps {
  navigation: any;
  route: any;
}

export const SimplePatientScreen: React.FC<SimplePatientScreenProps> = ({ navigation }) => {
  const { colors, scaleSize, ttsEnabled } = useAccessibility();

  // Mock patient's current due medicine
  const [currentDose, setCurrentDose] = useState({
    id: 'dose-101',
    loopId: 'loop-family-med',
    title: 'Amlodipine (Blood Pressure)',
    dosage: '5mg - 1 White Tablet',
    instructions: 'Take with a glass of water after breakfast',
    time: '08:00 AM',
    taken: false
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleTaken = () => {
    setCurrentDose((prev) => ({ ...prev, taken: true }));
    setToastMessage(`Recorded: ${currentDose.title} taken!`);
    setToastVisible(true);

    AccessibilityInfo.announceForAccessibility(`Marked ${currentDose.title} as taken.`);

    // Emit to real-time socket
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, {
        loopId: currentDose.loopId,
        itemId: currentDose.id,
        status: 'taken'
      });
    }
  };

  const handleSkip = () => {
    setCurrentDose((prev) => ({ ...prev, taken: true }));
    setToastMessage(`Skipped: ${currentDose.title}`);
    setToastVisible(true);

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, {
        loopId: currentDose.loopId,
        itemId: currentDose.id,
        status: 'skipped'
      });
    }
  };

  const handleUndo = () => {
    setCurrentDose((prev) => ({ ...prev, taken: false }));
    setToastVisible(false);
    AccessibilityInfo.announceForAccessibility('Check-in undone.');
  };

  const handleReadAloud = () => {
    speakMedicineReminder(currentDose.title, currentDose.dosage, currentDose.instructions);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Emergency Link Bar */}
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Emergency Contacts. Reach caregiver and doctor instantly"
          onPress={() => navigation.navigate('EmergencyInfo')}
          style={[styles.emergencyBar, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}
        >
          <Text style={[styles.emergencyText, { color: colors.dangerText, fontSize: scaleSize(18) }]}>
            🚨 Emergency Info & Contacts
          </Text>
        </TouchableOpacity>

        {/* Dedicated Single Medicine Card */}
        <View
          accessible={true}
          accessibilityRole="text"
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border
            }
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.statusBadge, { color: colors.warningText, backgroundColor: colors.warningBg, fontSize: scaleSize(16) }]}>
              ⏰ Due at {currentDose.time}
            </Text>

            {/* Read Aloud Button */}
            <TouchableOpacity
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Read medicine instructions aloud"
              onPress={handleReadAloud}
              style={[styles.speakerButton, { backgroundColor: colors.surfaceSubtle, minHeight: scaleSize(48), minWidth: scaleSize(48) }]}
            >
              <Text style={{ fontSize: scaleSize(24) }}>🔊</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaleSize(26) }]}>
            {currentDose.title}
          </Text>

          <Text style={[styles.dosage, { color: colors.primary, fontSize: scaleSize(22) }]}>
            {currentDose.dosage}
          </Text>

          <Text style={[styles.instructions, { color: colors.textSecondary, fontSize: scaleSize(18) }]}>
            {currentDose.instructions}
          </Text>

          {/* Big Single Action Check-in Button */}
          {!currentDose.taken ? (
            <View style={styles.actionContainer}>
              <PrimaryButton
                label="✓ Taken"
                variant="success"
                accessibilityHint="Double tap to record this dose as taken"
                onPress={handleTaken}
                style={{ marginVertical: 12 }}
              />

              <TouchableOpacity
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Skip this dose"
                onPress={handleSkip}
                style={[styles.skipButton, { minHeight: scaleSize(48) }]}
              >
                <Text style={[styles.skipText, { color: colors.textMuted, fontSize: scaleSize(18) }]}>
                  Skip this dose
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.completedBanner, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.completedText, { color: colors.successText, fontSize: scaleSize(22) }]}>
                ✓ You're all done for now!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 10-Second Undo Toast */}
      <UndoToast
        visible={toastVisible}
        message={toastMessage}
        onUndo={handleUndo}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  emergencyBar: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 20
  },
  emergencyText: {
    fontWeight: '700'
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    elevation: 4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: '700'
  },
  speakerButton: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  },
  title: {
    fontWeight: '800',
    marginBottom: 8
  },
  dosage: {
    fontWeight: '700',
    marginBottom: 12
  },
  instructions: {
    lineHeight: 26,
    marginBottom: 24
  },
  actionContainer: {
    marginTop: 10
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12
  },
  skipText: {
    textDecorationLine: 'underline',
    fontWeight: '600'
  },
  completedBanner: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16
  },
  completedText: {
    fontWeight: '800'
  }
});
