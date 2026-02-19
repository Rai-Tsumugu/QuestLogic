import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AlertCircle, Star } from 'lucide-react-native';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ navigation, route }: Props) {
  const { result, beforeImage, afterImage } = route.params;
  const stars = Math.round(result.total_score / 20);
  const bonusMinutes = 30 + (result.total_score > 80 ? 15 : 0);

  const onReceiveReward = () => {
    Alert.alert('報酬を確定', `${bonusMinutes}分のゲーム時間を付与します。`, [
      {
        text: '続ける',
        onPress: () => navigation.navigate('NFCUnlock', { bonusMinutes }),
      },
      {
        text: 'キャンセル',
        style: 'cancel',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.score}>{result.total_score}</Text>
        <Text style={styles.scoreLabel}>pts</Text>

        <View style={styles.starRow}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} color={index < stars ? '#F4C95D' : '#5A6182'} fill={index < stars ? '#F4C95D' : 'none'} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AIコーチからのメッセージ</Text>
          <Text style={styles.cardText}>{result.feedback_to_child}</Text>
        </View>

        <View style={styles.imageRow}>
          <View style={styles.imageCard}>
            <Image source={{ uri: beforeImage.uri }} style={styles.image} />
            <Text style={styles.imageLabel}>Before</Text>
          </View>
          <View style={styles.imageCard}>
            <Image source={{ uri: afterImage.uri }} style={styles.image} />
            <Text style={styles.imageLabel}>After</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <ScoreItem label="作業量" score={result.score_breakdown.volume} />
          <ScoreItem label="丁寧さ" score={result.score_breakdown.carefulness} />
          <ScoreItem label="思考プロセス" score={result.score_breakdown.process} />
          <ScoreItem label="見直し" score={result.score_breakdown.review} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>保護者向けレポート</Text>
          <Text style={styles.cardText}>{result.feedback_to_parent}</Text>
        </View>

        {result.suspicion_flag ? (
          <View style={styles.alertCard}>
            <AlertCircle color="#FF9EA0" size={18} />
            <Text style={styles.alertText}>{result.suspicion_reason ?? '確認が必要なポイントがあります。'}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.secondaryButtonText}>閉じる</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onReceiveReward}>
            <Text style={styles.primaryButtonText}>報酬を受け取る</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScoreItem({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreItemLabel}>{label}</Text>
      <Text style={styles.scoreItemValue}>{score}/10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050A1A',
  },
  container: {
    padding: 20,
    gap: 14,
  },
  score: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '900',
  },
  scoreLabel: {
    textAlign: 'center',
    color: '#AEB9E8',
    marginTop: -16,
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#101A3A',
    borderColor: '#2F3E7E',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cardTitle: {
    color: '#DCE2FF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardText: {
    color: '#F2F4FF',
    lineHeight: 20,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  imageCard: {
    flex: 1,
    backgroundColor: '#0F1734',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
  },
  imageLabel: {
    color: '#C8D0FF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreItem: {
    width: '48%',
    backgroundColor: '#0E1735',
    borderColor: '#283468',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  scoreItemLabel: {
    color: '#AFB9E4',
    fontSize: 12,
  },
  scoreItemValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#351420',
    borderColor: '#673444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  alertText: {
    color: '#FFCFD0',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1D274F',
    borderWidth: 1,
    borderColor: '#364A8F',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#D2DBFF',
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6678FF',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
