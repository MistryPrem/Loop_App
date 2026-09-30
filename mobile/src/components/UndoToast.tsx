import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface UndoToastProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationSeconds?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  visible,
  message,
  onUndo,
  onDismiss,
  durationSeconds = 10
}) => {
  const { colors, scaleSize } = useAccessibility();
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);

  useEffect(() => {
    if (!visible) return;

    setSecondsRemaining(durationSeconds);
    AccessibilityInfo.announceForAccessibility(`${message}. You have 10 seconds to undo.`);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.border
        }
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.message, { color: colors.textPrimary, fontSize: scaleSize(18) }]}>
          ✓ {message}
        </Text>
        <Text style={[styles.timer, { color: colors.textSecondary, fontSize: scaleSize(16) }]}>
          Auto-confirms in {secondsRemaining}s
        </Text>
      </View>

      <TouchableOpacity
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Undo check-in"
        onPress={onUndo}
        style={[styles.undoButton, { backgroundColor: colors.warning, minHeight: scaleSize(48) }]}
      >
        <Text style={[styles.undoText, { color: colors.warningText, fontSize: scaleSize(18) }]}>
          Undo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 }
  },
  textContainer: {
    flex: 1,
    paddingRight: 12
  },
  message: {
    fontWeight: '700'
  },
  timer: {
    marginTop: 4
  },
  undoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  undoText: {
    fontWeight: '700'
  }
});
