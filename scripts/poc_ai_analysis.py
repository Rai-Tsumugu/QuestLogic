import os
import json
from google import genai
from PIL import Image
from dotenv import load_dotenv
from datetime import datetime

# .envファイルから環境変数を読み込み
load_dotenv()

# Geminiの初期セットアップ
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    exit(1)

client = genai.Client(api_key=API_KEY)

# モデルの選定 (Phase 1 設計書に基づき gemini-2.0-flash)
MODEL_NAME = "gemini-3-flash-preview" 

def analyze_homework(before_image_path, after_image_path, metadata):
    """
    Before/After画像とメタデータを元に、Geminiで宿題を解析する
    """
    # システムプロンプト (設計書より)
    system_instruction = f"""
あなたは、子供の自律的な学習を支援する熟練の「AI家庭教師」です。
あなたの目的は、単に「正解したか」を判定することではなく、子供の「努力のプロセス」と「誠実さ」を評価し、親に客観的なレポートを提供することです。

## 評価基準
1. 作業量 (Volume): Before/Afterの差分。ページがどの程度埋まっているか。
2. 試行錯誤 (Process): 消しゴムを使った跡、二重線での修正、余白への計算、独自のメモ書き。
3. 丁寧さ (Carefulness): 文字の乱雑さ（殴り書きでないか）、図や線の丁寧さ。
4. 振り返り (Review): 赤ペンや青ペンによる丸付け、解き直し、間違いの原因メモ。

## 宿題メタデータ
- 教科: {metadata.get('subject', '不明')}
- 単元: {metadata.get('topic', '不明')}
- 親のこだわり: {metadata.get('parent_focus', '特なし')}

## 回答フォーマット
必ず以下のJSON形式でのみ回答してください。他のテキストを含めないでください。

{{
  "summary": "概略",
  "score_breakdown": {{
    "volume": 0-10,
    "process": 0-10,
    "carefulness": 0-10,
    "review": 0-10
  }},
  "total_score": 0-100,
  "features": [
    {{ "type": "特徴種別", "location": "場所", "description": "詳細説明" }}
  ],
  "suspicion_flag": boolean,
  "suspicion_reason": string or null,
  "feedback_to_child": "子供へのメッセージ",
  "feedback_to_parent": "親へのメッセージ"
}}
"""

    # 解析実行
    # 実際の実装ではBefore/Afterの画像を並べて「この2つの差分を見て」と指示するのが効果的
    prompt = "添付した1枚目が学習前(Before)、2枚目が学習後(After)です。差分を分析して評価してください。"
    
    try:
        # 画像の読み込み（PIL Imageをそのまま送信可能）
        before_img = Image.open(before_image_path)
        after_img = Image.open(after_image_path)

        response = client.models.generate_content(
            model=MODEL_NAME,
            config={
                "system_instruction": system_instruction,
                "response_mime_type": "application/json"
            },
            contents=[before_img, after_img, prompt]
        )
        
        # JSON形式でパース
        return json.loads(response.text)

    except Exception as e:
        return {
            "error": "Failed to analyze or parse AI response",
            "exception": str(e)
        }



if __name__ == "__main__":
    # テスト用の設定
    # 実行前に images/before_sample.jpg, images/after_sample.jpg を用意してください
    test_before = "images/before_sample.jpg"
    test_after = "images/after_sample.jpg"
    
    test_metadata = {
        "subject": "数学",
        "topic": "方程式",
        "parent_focus": "途中式を飛ばさず書いているか"
    }

    print(f"Analyzing {test_before} vs {test_after}...")
    
    if not os.path.exists(test_before) or not os.path.exists(test_after):
        print("Error: Sample images not found. Please place images in the specified paths.")
        print(f"Expected: {test_before}, {test_after}")
    else:
        result = analyze_homework(test_before, test_after, test_metadata)
        
        # 結果の表示
        result_json = json.dumps(result, indent=2, ensure_ascii=False)
        print(result_json)
        
        # 結果をファイルに保存 (<日付>.txt)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_dir = "results"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        output_file = os.path.join(output_dir, f"{timestamp}.txt")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(result_json)
        
        print(f"\nResult saved to: {output_file}")
