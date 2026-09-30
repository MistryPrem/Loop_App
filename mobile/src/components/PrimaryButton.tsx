import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger' | 'surface';
  accessibilityHint?: string;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  accessibilityHint,
  style
}) => {
  const { colors, scaleSize } = useAccessibility();

  let bgColor = colors.primary;
  let textColor = colors.primaryText;

  if (variant === 'success') {
    bgColor = colors.success;
    textColor = colors.successText;
  } else if (variant === 'danger') {
    bgColor = colors.danger;
    textColor = colors.dangerText;
  } else if (variant === 'surface') {
    bgColor = colors.surfaceSubtle;
    textColor = colors.textPrimary;
  }

  // 64px+ height for primary check-in buttons, guaranteed 48px+ minimum
  const minHeight = scaleSize(64);
  const fontSize = scaleSize(20);

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderColor: colors.border,
          minHeight
        },
        style
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginVertical: 8
  },
  text: {
    fontWeight: '700',
    textAlign: 'center'
  }
});
