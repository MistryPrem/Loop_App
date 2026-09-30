import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { useConnectivity } from '../context/ConnectivityContext';
import { useAccessibility } from '../context/AccessibilityContext';

export const OfflineStatusBar: React.FC = () => {
  const { isConnected, pendingCount, syncNow, statusText } = useConnectivity();
  const { colors, scaleSize } = useAccessibility();

  if (isConnected && pendingCount === 0) {
    return null;
  }

  const bgColor = !isConnected ? colors.warningBg : colors.infoBg;
  const textColor = !isConnected ? colors.warningText : colors.infoText;
  const borderColor = !isConnected ? colors.warning : colors.info;

  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={statusText}
      style={[styles.container, { backgroundColor: bgColor, borderColor }]}
    >
      <View style={styles.textRow}>
        <Text style={{ fontSize: scaleSize(18), marginRight: 8 }}>
          {!isConnected ? '📡' : '🔄'}
        </Text>
        <Text style={[styles.text, { color: textColor, fontSize: scaleSize(16) }]}>
          {statusText}
        </Text>
      </View>

      {isConnected && pendingCount > 0 && (
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry syncing pending check-ins now"
          onPress={syncNow}
          style={[styles.retryBtn, { backgroundColor: colors.info, minHeight: scaleSize(40) }]}
        >
          <Text style={[styles.retryText, { color: colors.infoText, fontSize: scaleSize(14) }]}>
            Sync
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8
  },
  text: {
    fontWeight: '600',
    flexShrink: 1
  },
  retryBtn: {
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  retryText: {
    fontWeight: '700'
  }
});
