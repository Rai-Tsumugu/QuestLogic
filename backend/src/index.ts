import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure Multer for memory storage (files handled in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("GEMINI_API_KEY is missing!");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
// Using the same model as in PoC
const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: `あなたは、子供の自律的な学習を支援する熟練の「AI家庭教師」です。
あなたの目的は、単に「正解したか」を判定することではなく、子供の「努力のプロセス」と「誠実さ」を評価し、親に客観的なレポートを提供することです。

## 評価基準
1. 作業量 (Volume): Before/Afterの差分。ページがどの程度埋まっているか。
2. 試行錯誤 (Process): 消しゴムを使った跡、二重線での修正、余白への計算、独自のメモ書き。
3. 丁寧さ (Carefulness): 文字の乱雑さ（殴り書きでないか）、図や線の丁寧さ。
4. 振り返り (Review): 赤ペンや青ペンによる丸付け、解き直し、間違いの原因メモ。

## 回答フォーマット
必ず以下のJSON形式でのみ回答してください。他のテキストを含めないでください。

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
  "feedback_to_child": "子供へのメッセージ",
  "feedback_to_parent": "親へのメッセージ"
}`
});

function fileToGenerativePart(buffer: Buffer, mimeType: string) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType
        },
    };
}

app.post('/api/analyze', upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]), async (req, res) => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const beforeFile = files['beforeImage']?.[0];
        const afterFile = files['afterImage']?.[0];
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

        if (!beforeFile || !afterFile) {
            res.status(400).json({ error: 'Both beforeImage and afterImage are required.' });
            return
        }

        const prompt = `添付した1枚目が学習前(Before)、2枚目が学習後(After)です。差分を分析して評価してください。
        
        ## 宿題メタデータ
        - 教科: ${metadata.subject || '不明'}
        - 単元: ${metadata.topic || '不明'}
        - 親のこだわり: ${metadata.parent_focus || '特なし'}
        `;

        const imageParts = [
            fileToGenerativePart(beforeFile.buffer, beforeFile.mimetype),
            fileToGenerativePart(afterFile.buffer, afterFile.mimetype),
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
        const jsonResult = JSON.parse(jsonStr);

        res.json(jsonResult);

    } catch (error: any) {
        console.error("Error analyzing homework:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
