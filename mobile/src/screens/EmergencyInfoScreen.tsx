import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';
import { PrimaryButton } from '../components/PrimaryButton';

export const EmergencyInfoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, scaleSize } = useAccessibility();

  // In production, loaded from /api/v1/emergency/:loopId/:userId
  const emergencyData = {
    patientName: 'Eleanor Vance',
    primaryContact: {
      name: 'Sarah Vance (Daughter / Caregiver)',
      phone: '+1 (555) 234-5678'
    },
    doctor: {
      name: 'Dr. Michael Chen (Cardiologist)',
      phone: '+1 (555) 876-5432'
    },
    hospital: 'Memorial General Hospital (Room 4B / Cardiac Clinic)',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    bloodType: 'O Positive',
    notes: 'Pacemaker implanted in 2023. Carries nitroglycerin in purse.'
  };

  const callNumber = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerTitle, { color: colors.danger, fontSize: scaleSize(26) }]}>
        🚨 Emergency Medical Information
      </Text>

      {/* Primary Caregiver Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardHeader, { color: colors.primary, fontSize: scaleSize(18) }]}>
          PRIMARY CAREGIVER CONTACT
        </Text>
        <Text style={[styles.name, { color: colors.textPrimary, fontSize: scaleSize(22) }]}>
          {emergencyData.primaryContact.name}
        </Text>
        <PrimaryButton
          label={`📞 Call ${emergencyData.primaryContact.phone}`}
          variant="danger"
          accessibilityHint="Double tap to place a direct phone call to the primary caregiver"
          onPress={() => callNumber(emergencyData.primaryContact.phone)}
          style={{ marginTop: 12 }}
        />
      </View>

      {/* Doctor Contact */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardHeader, { color: colors.primary, fontSize: scaleSize(18) }]}>
          ATTENDING PHYSICIAN
        </Text>
        <Text style={[styles.name, { color: colors.textPrimary, fontSize: scaleSize(22) }]}>
          {emergencyData.doctor.name}
        </Text>
        <PrimaryButton
          label={`📞 Call Doctor ${emergencyData.doctor.phone}`}
          variant="primary"
          accessibilityHint="Double tap to place a phone call to the doctor"
          onPress={() => callNumber(emergencyData.doctor.phone)}
          style={{ marginTop: 12 }}
        />
      </View>

      {/* Critical Medical Notes */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardHeader, { color: colors.danger, fontSize: scaleSize(18) }]}>
          ALLERGIES & CRITICAL NOTES
        </Text>
        <Text style={[styles.allergyText, { color: colors.dangerText, backgroundColor: colors.dangerBg, fontSize: scaleSize(18) }]}>
          Allergies: {emergencyData.allergies.join(', ')}
        </Text>
        <Text style={[styles.notesText, { color: colors.textPrimary, fontSize: scaleSize(18) }]}>
          Blood Type: {emergencyData.bloodType}
        </Text>
        <Text style={[styles.notesText, { color: colors.textSecondary, fontSize: scaleSize(18) }]}>
          {emergencyData.notes}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  headerTitle: {
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16
  },
  cardHeader: {
    fontWeight: '700',
    marginBottom: 6
  },
  name: {
    fontWeight: '700'
  },
  allergyText: {
    padding: 12,
    borderRadius: 12,
    fontWeight: '700',
    marginVertical: 10
  },
  notesText: {
    marginTop: 8,
    lineHeight: 26
  }
});
