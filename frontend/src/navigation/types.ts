import type { AnalysisResult, CapturedImage } from '../types/analysis';

export type RootStackParamList = {
  RoleSelect: undefined;
  MissionCamera: undefined;
  Result: {
    result: AnalysisResult;
    beforeImage: CapturedImage;
    afterImage: CapturedImage;
  };
  NFCUnlock: {
    bonusMinutes: number;
  };
};
