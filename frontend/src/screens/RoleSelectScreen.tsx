import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Gamepad2, ShieldCheck, Sparkles } from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/types';
import { useGameSession } from '../context/GameSessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

export function RoleSelectScreen({ navigation }: Props) {
  const { gameTime } = useGameSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Sparkles color="#95A2FF" size={16} />
          <Text style={styles.badgeText}>
            {gameTime > 0 ? `残りゲーム時間: ${gameTime}分` : 'AI-Powered Learning Management'}
          </Text>
        </View>

        <Text style={styles.title}>SmartStudy Gate</Text>
        <Text style={styles.subtitle}>AIが努力を評価し、報酬へつなぐ学習体験</Text>

        <Pressable style={styles.card} onPress={() => Alert.alert('準備中', '保護者ダッシュボードは次フェーズで実装します。')}>
          <ShieldCheck color="#8E9AFF" size={28} />
          <Text style={styles.cardTitle}>管理者 (親)</Text>
          <Text style={styles.cardText}>学習履歴・承認フローは次フェーズで対応します。</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => navigation.navigate('MissionCamera')}>
          <Gamepad2 color="#8E9AFF" size={28} />
          <Text style={styles.cardTitle}>挑戦者 (子供)</Text>
          <Text style={styles.cardText}>宿題の前後を撮影してAI評価を開始します。</Text>
        </Pressable>
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
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },
  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#182148',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3B7A',
    marginBottom: 8,
  },
  badgeText: {
    color: '#C3CBF2',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 36,
    textAlign: 'center',
  },
  subtitle: {
    color: '#A7B0D8',
    textAlign: 'center',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#111B3A',
    borderWidth: 1,
    borderColor: '#2A3671',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  cardTitle: {
    color: '#F8FAFF',
    fontSize: 20,
    fontWeight: '700',
  },
  cardText: {
    color: '#A8B1D8',
    fontSize: 14,
  },
});
