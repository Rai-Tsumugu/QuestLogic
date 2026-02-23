/**
 * ------------------------------------------------------------------
 * Gemini AI Service
 * @description
 * 宿題のBefore/After画像をGemini APIに送信し、評価結果を取得します。
 * ------------------------------------------------------------------
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// AIモデルの初期化
const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = 'gemini-3-flash-preview'; // または gemini-1.5-flash

// ローカルファイルをGemini用のフォーマットに変換するヘルパー関数
function fileToGenerativePart(filePath: string, mimeType: string) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}

export const analyzeHomeworkImages = async (
    beforeImagePath: string,
    afterImagePath: string,
    metadata: { subject: string; topic: string; parentFocus: string }
) => {
    if (!API_KEY) {
        throw new Error('GEMINI_API_KEYが設定されていません。');
    }

    const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" }
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
- 親のこだわり: ${metadata.parentFocus}

## 回答フォーマット
必ず以下のJSON形式でのみ回答してください。
{
  "summary": "概略（親向けに努力のプロセスを強調すること）",
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
  "suspicion_reason": "理由" または null,
  "feedback_to_child": "子供へのメッセージ（ポジティブに）",
  "feedback_to_parent": "親へのメッセージ（サポートと称賛を促す内容）"
}
`;

    try {
        const beforePart = fileToGenerativePart(beforeImagePath, "image/jpeg");
        const afterPart = fileToGenerativePart(afterImagePath, "image/jpeg");
        const prompt = "添付した1枚目が学習前(Before)、2枚目が学習後(After)です。差分を分析して評価してください。";

        const result = await model.generateContent([
            systemPrompt,
            beforePart,
            afterPart,
            prompt
        ]);

        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("AI分析中にエラーが発生しました。");
    }
};