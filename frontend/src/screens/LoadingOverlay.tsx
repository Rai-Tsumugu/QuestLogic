import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'AIがノートを分析中...' }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#7C8CFF" />
          <Text style={styles.title}>Analyzing...</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    backgroundColor: '#101A37',
    borderWidth: 1,
    borderColor: '#334082',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
    marginTop: 8,
  },
  message: {
    color: '#B4BCDF',
    textAlign: 'center',
  },
});
