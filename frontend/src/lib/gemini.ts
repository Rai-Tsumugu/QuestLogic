import type { AnalysisResult, AnalyzeMetadata, CapturedImage } from '../types/analysis';
import { getApiBaseUrl } from './api';

const DEFAULT_METADATA: AnalyzeMetadata = {
  subject: '算数',
  topic: '計算',
  parent_focus: '途中式',
};

function appendImage(formData: FormData, fieldName: 'beforeImage' | 'afterImage', image: CapturedImage) {
  formData.append(fieldName, {
    uri: image.uri,
    type: image.mimeType,
    name: image.fileName,
  } as any);
}

export async function analyzeHomework(
  beforeImage: CapturedImage,
  afterImage: CapturedImage,
  metadata: AnalyzeMetadata = DEFAULT_METADATA,
): Promise<AnalysisResult> {
  const formData = new FormData();
  appendImage(formData, 'beforeImage', beforeImage);
  appendImage(formData, 'afterImage', afterImage);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await fetch(`${getApiBaseUrl()}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Server Error: ${response.status} ${errorText}`);
  }

  return (await response.json()) as AnalysisResult;
}
