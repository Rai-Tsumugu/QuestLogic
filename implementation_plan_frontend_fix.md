# 実行プラン: frontend の依存関係修復と Expo バージョン調整

ユーザーの依頼に基づき、`frontend` ディレクトリでのパッケージインストールと Expo の依存関係自動修正（`npx expo install --fix`）を実行します。

## 実施手順

1. **パッケージのインストール**:
   - `frontend` ディレクトリにおいて `npm install` を実行します。
   - `ERESOLVE` エラーが発生しているため、`--legacy-peer-deps` フラグを使用して依存関係の競合を回避します。

2. **Expo 依存関係の修正**:
   - `npx expo install --fix` を実行し、現在インストールされている Expo SDK バージョンに最適なライブラリバージョンへ自動調整します。

3. **結果の確認**:
   - `package.json` の内容を確認し、バージョンがどのように更新されたかを確認します。

## 実行予定のコマンド

```powershell
cd d:\programing\workspace\QuestLogic\frontend
npm install --legacy-peer-deps
npx expo install --fix
```
