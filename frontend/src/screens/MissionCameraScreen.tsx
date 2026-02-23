import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, FolderOpen, RotateCcw } from 'lucide-react-native';
import { analyzeHomework } from '../lib/gemini';
import type { RootStackParamList } from '../navigation/types';
import type { CapturedImage } from '../types/analysis';
import { LoadingOverlay } from './LoadingOverlay';

type Props = NativeStackScreenProps<RootStackParamList, 'MissionCamera'>;
type ImageTarget = 'before' | 'after';

function fromAsset(asset: ImagePicker.ImagePickerAsset, target: ImageTarget): CapturedImage {
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileName: asset.fileName ?? `${target}-${Date.now()}.jpg`,
  };
}

export function MissionCameraScreen({ navigation }: Props) {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [beforeImage, setBeforeImage] = useState<CapturedImage | null>(null);
  const [afterImage, setAfterImage] = useState<CapturedImage | null>(null);
  const [activeTarget, setActiveTarget] = useState<ImageTarget>('before');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('画像をアップロード中...');

  const canAnalyze = useMemo(() => Boolean(beforeImage && afterImage), [beforeImage, afterImage]);

  const setTargetImage = (target: ImageTarget, image: CapturedImage) => {
    if (target === 'before') {
      setBeforeImage(image);
      if (!afterImage) {
        setActiveTarget('after');
      }
      return;
    }

    setAfterImage(image);
  };

  const openCamera = async (target: ImageTarget) => {
    setActiveTarget(target);

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('権限が必要です', 'カメラ権限を許可してから再試行してください。');
        return;
      }
    }

    setCameraVisible(true);
  };

  const openLibrary = async (target: ImageTarget) => {
    setActiveTarget(target);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setTargetImage(target, fromAsset(result.assets[0], target));
    }
  };

  const captureFromCamera = async () => {
    if (!cameraRef.current) {
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.9,
      skipProcessing: true,
    });

    setTargetImage(activeTarget, {
      uri: photo.uri,
      mimeType: 'image/jpeg',
      fileName: `${activeTarget}-${Date.now()}.jpg`,
    });
    setCameraVisible(false);
  };

  const startAnalysis = async () => {
    if (!beforeImage || !afterImage) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStage('画像をスキャン中...');

    const stages = [
      '画像をスキャン中...',
      '学習前の状態と比較中...',
      '努力の痕跡を解析中...',
      'AIコーチが評価を作成中...',
    ];

    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stages.length - 1);
      setAnalysisStage(stages[stageIndex]);
    }, 1500);

    try {
      const result = await analyzeHomework(beforeImage, afterImage);
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      navigation.navigate('Result', {
        result,
        beforeImage,
        afterImage,
      });
    } catch (error: any) {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      Alert.alert('AI分析に失敗しました', error?.message ?? '時間をおいて再度お試しください。');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingOverlay visible={isAnalyzing} message={analysisStage} />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>戻る</Text>
        </Pressable>

        <Text style={styles.title}>ミッション: 今日の宿題</Text>

        <CaptureCard
          label="STEP 1: 宿題をやる前"
          subLabel="まっさらなノートを撮影しよう"
          image={beforeImage}
          onCapture={() => openCamera('before')}
          onPick={() => openLibrary('before')}
        />

        {beforeImage ? (
          <CaptureCard
            label="STEP 2: 宿題が終わった後"
            subLabel="頑張って書いたノートを撮影しよう"
            image={afterImage}
            onCapture={() => openCamera('after')}
            onPick={() => openLibrary('after')}
          />
        ) : null}

        {canAnalyze ? (
          <Pressable style={styles.analyzeButton} onPress={startAnalysis}>
            <Text style={styles.analyzeButtonText}>AI分析を開始する</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.cameraView} facing="back" />
          <View style={styles.cameraControls}>
            <Pressable style={styles.controlButton} onPress={() => setCameraVisible(false)}>
              <Text style={styles.controlButtonText}>閉じる</Text>
            </Pressable>
            <Pressable style={styles.captureButton} onPress={captureFromCamera}>
              <Camera color="#FFFFFF" size={26} />
            </Pressable>
            <View style={styles.controlButtonPlaceholder} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CaptureCard({
  label,
  subLabel,
  image,
  onCapture,
  onPick,
}: {
  label: string;
  subLabel: string;
  image: CapturedImage | null;
  onCapture: () => void;
  onPick: () => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardText}>{subLabel}</Text>

      {image ? <Image source={{ uri: image.uri }} style={styles.previewImage} /> : <View style={styles.placeholder} />}

      <View style={styles.cardActions}>
        <Pressable style={styles.smallButton} onPress={onCapture}>
          <Camera color="#D9DEFF" size={18} />
          <Text style={styles.smallButtonText}>撮影する</Text>
        </Pressable>
        <Pressable style={styles.smallButton} onPress={onPick}>
          <FolderOpen color="#D9DEFF" size={18} />
          <Text style={styles.smallButtonText}>画像を選ぶ</Text>
        </Pressable>
      </View>

      {image ? (
        <View style={styles.capturedTag}>
          <RotateCcw color="#C0C9FA" size={14} />
          <Text style={styles.capturedTagText}>再撮影・再選択できます</Text>
        </View>
      ) : null}
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
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1A2652',
  },
  backButtonText: {
    color: '#D9DEFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#0E1734',
    borderWidth: 1,
    borderColor: '#2B3A73',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  cardText: {
    color: '#A8B1D8',
  },
  placeholder: {
    height: 180,
    borderRadius: 12,
    backgroundColor: '#16234B',
    borderWidth: 1,
    borderColor: '#2A3971',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A2756',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334280',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallButtonText: {
    color: '#E0E5FF',
    fontWeight: '600',
  },
  capturedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capturedTagText: {
    color: '#C0C9FA',
    fontSize: 12,
  },
  analyzeButton: {
    marginTop: 8,
    backgroundColor: '#6879FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraView: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4B5FE0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#CCD3FF',
  },
  controlButtonPlaceholder: {
    width: 72,
    height: 40,
  },
});
