import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Lock, Smartphone, Zap } from 'lucide-react-native';
import { useGameSession } from '../context/GameSessionContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NFCUnlock'>;
type Status = 'waiting' | 'scanning' | 'success';

export function NFCUnlockScreen({ navigation, route }: Props) {
  const { addGameTime } = useGameSession();
  const [status, setStatus] = useState<Status>('waiting');
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current = [];
    };
  }, []);

  const runSimulation = () => {
    setStatus('scanning');

    const scanTimer = setTimeout(() => {
      setStatus('success');

      const completeTimer = setTimeout(() => {
        addGameTime(route.params.bonusMinutes);
        navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelect' }],
        });
      }, 1000) as unknown as number;

      timers.current.push(completeTimer);
    }, 1500) as unknown as number;

    timers.current.push(scanTimer);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {status === 'waiting' ? (
          <>
            <View style={styles.iconCircle}>
              <Lock color="#9BA9FF" size={68} />
            </View>
            <Text style={styles.title}>報酬を解錠する</Text>
            <Text style={styles.subtitle}>スマホをNFCボタンにかざしてください</Text>

            <View style={styles.iconRow}>
              <Smartphone color="#DCE3FF" size={30} />
              <Zap color="#FFE087" size={30} />
            </View>

            <Pressable style={styles.button} onPress={runSimulation}>
              <Text style={styles.buttonText}>デバイスにかざす (シミュレート)</Text>
            </Pressable>
          </>
        ) : null}

        {status === 'scanning' ? (
          <>
            <View style={styles.iconCircle}>
              <Zap color="#A1ADFF" size={56} />
            </View>
            <Text style={styles.title}>スキャン中...</Text>
            <Text style={styles.subtitle}>NFC ID: GT-PLUG-0922</Text>
          </>
        ) : null}

        {status === 'success' ? (
          <>
            <View style={[styles.iconCircle, styles.successCircle]}>
              <CheckCircle2 color="#FFFFFF" size={68} />
            </View>
            <Text style={styles.title}>Unlocked!</Text>
            <Text style={styles.subtitle}>{route.params.bonusMinutes}分の報酬が付与されました</Text>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050A1A',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#16224B',
    borderWidth: 1,
    borderColor: '#324180',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    backgroundColor: '#2A8A63',
    borderColor: '#4FB58B',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#BDC8F4',
    textAlign: 'center',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6578FF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
