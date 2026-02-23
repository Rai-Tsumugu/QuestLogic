export interface CapturedImage {
  uri: string;
  mimeType: string;
  fileName: string;
}

export interface AnalysisResult {
  summary: string;
  score_breakdown: {
    volume: number;
    process: number;
    carefulness: number;
    review: number;
  };
  total_score: number;
  features: {
    type: string;
    location: string;
    description: string;
  }[];
  suspicion_flag: boolean;
  suspicion_reason: string | null;
  feedback_to_child: string;
  feedback_to_parent: string;
}

export interface AnalyzeMetadata {
  subject: string;
  topic: string;
  parent_focus: string;
}

