import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Model configuration
const MODEL_NAME = "gemini-3-flash-preview";

export interface AnalysisResult {
    summary: string;
    score_breakdown: {
        volume: number;
        process: number;
        carefulness: number;
        review: number;
    };
    total_score: number;
    features: Array<{
        type: string;
        location: string;
        description: string;
    }>;
    suspicion_flag: boolean;
    suspicion_reason: string | null;
    feedback_to_child: string;
    feedback_to_parent: string;
}

// Helper to convert File to GenerativePart
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix (e.g. "data:image/jpeg;base64,")
            const base64Data = base64String.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                },
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export async function analyzeHomework(
    beforeImage: File,
    afterImage: File,
    metadata = { subject: '算数', topic: '計算', parent_focus: '途中式' }
): Promise<AnalysisResult> {

    if (!API_KEY) {
        throw new Error("Gemini API Key is not set");
    }

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const systemPrompt = `
あなたは、子供の自律的な学習を支援する熟練の「AI家庭教師」です。
あなたの目的は、単に「正解したか」を判定することではなく、子供の「努力のプロセス」と「誠実さ」を評価し、親に客観的なレポートを提供することです。

## 評価基準
1. 作業量 (Volume): Before/Afterの差分。ページがどの程度埋まっているか。
2. 試行錯誤 (Process): 消しゴムを使った跡、二重線での修正、余白への計算、独自のメモ書き。
3. 丁寧さ (Carefulness): 文字の乱雑さ（殴り書きでないか）、図や線の丁寧さ。
4. 振り返り (Review): 赤ペンや青ペンによる丸付け、解き直し、間違いの原因メモ。

## 宿題メタデータ
- 教科: ${metadata.subject}
- 単元: ${metadata.topic}
- 親のこだわり: ${metadata.parent_focus}

## 回答フォーマット
必ず以下のJSON形式でのみ回答してください。

{
  "summary": "概略",
  "score_breakdown": {
    "volume": 0-10,
    "process": 0-10,
    "carefulness": 0-10,
    "review": 0-10
  },
  "total_score": 0-100,
  "features": [
    { "type": "特徴種別", "location": "場所", "description": "詳細説明" }
  ],
  "suspicion_flag": boolean,
  "suspicion_reason": string or null,
  "feedback_to_child": "子供へのメッセージ（ポジティブに）",
  "feedback_to_parent": "親へのメッセージ"
}
`;

    try {
        const beforePart = await fileToGenerativePart(beforeImage);
        const afterPart = await fileToGenerativePart(afterImage);

        // User Prompt
        const prompt = "添付した1枚目が学習前(Before)、2枚目が学習後(After)です。差分を分析して評価してください。";

        const result = await model.generateContent([
            systemPrompt,
            beforePart,
            afterPart,
            prompt
        ]);

        const responseText = result.response.text();
        console.log("Raw AI Response:", responseText);

        return JSON.parse(responseText) as AnalysisResult;

    } catch (error) {
        console.error("Analysis failed:", error);
        throw error;
    }
}
