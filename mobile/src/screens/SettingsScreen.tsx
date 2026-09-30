import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useAccessibility, ThemeType } from '../context/AccessibilityContext';
import { PrimaryButton } from '../components/PrimaryButton';

export const SettingsScreen: React.FC = () => {
  const {
    theme,
    setTheme,
    simpleMode,
    setSimpleMode,
    ttsEnabled,
    setTtsEnabled,
    colors,
    scaleSize,
    fontScale
  } = useAccessibility();

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.header, { color: colors.textPrimary, fontSize: scaleSize(26) }]}>
        Accessibility & Preferences
      </Text>

      {/* Simple Patient Mode Toggle */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaleSize(20) }]}>
              Simple Mode (Patient Mode)
            </Text>
            <Text style={[styles.desc, { color: colors.textSecondary, fontSize: scaleSize(16) }]}>
              Displays one giant medicine card at a time with large text and a single 'Taken' button.
            </Text>
          </View>
          <Switch
            accessible={true}
            accessibilityLabel="Toggle Simple Patient Mode"
            value={simpleMode}
            onValueChange={setSimpleMode}
          />
        </View>
      </View>

      {/* Text-to-Speech Toggle */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaleSize(20) }]}>
              Read Aloud (Text-to-Speech)
            </Text>
            <Text style={[styles.desc, { color: colors.textSecondary, fontSize: scaleSize(16) }]}>
              Speaks out medicine names, doses, and friendly reminders in a calm voice.
            </Text>
          </View>
          <Switch
            accessible={true}
            accessibilityLabel="Toggle Text to speech readout"
            value={ttsEnabled}
            onValueChange={setTtsEnabled}
          />
        </View>
      </View>

      {/* Contrast / Theme Selector */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaleSize(20), marginBottom: 12 }]}>
          Visual Contrast Theme
        </Text>

        <PrimaryButton
          label="☀️ Light Theme"
          variant={theme === 'light' ? 'primary' : 'surface'}
          onPress={() => setTheme('light')}
          style={{ marginVertical: 6 }}
        />
        <PrimaryButton
          label="🌙 Dark Theme"
          variant={theme === 'dark' ? 'primary' : 'surface'}
          onPress={() => setTheme('dark')}
          style={{ marginVertical: 6 }}
        />
        <PrimaryButton
          label="👁️ High Contrast (AAA)"
          variant={theme === 'highContrast' ? 'primary' : 'surface'}
          onPress={() => setTheme('highContrast')}
          style={{ marginVertical: 6 }}
        />
      </View>

      {/* OS Font Scaling Info */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary, fontSize: scaleSize(18) }]}>
          System Text Scaling
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary, fontSize: scaleSize(16) }]}>
          Current OS Font Scale multiplier: {fontScale.toFixed(2)}x. Loop dynamically scales all text,
          cards, and touch targets to honor your phone's display settings.
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
  header: {
    fontWeight: '800',
    marginBottom: 20
  },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textContainer: {
    flex: 1,
    paddingRight: 16
  },
  title: {
    fontWeight: '700',
    marginBottom: 6
  },
  desc: {
    lineHeight: 22
  }
});
