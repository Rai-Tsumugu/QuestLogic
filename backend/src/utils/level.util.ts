/**
 * ------------------------------------------------------------------
 * Level Utility
 * @description
 * レベル計算と経験値(EXP)の処理を行います。
 * ------------------------------------------------------------------
 */

// 次のレベルに必要な経験値を計算する関数
// ※ 企画が固まるまでの仮の計算式 (例: レベル1->2は100、以降は指数関数的に増加)
export const getRequiredExp = (level: number): number => {
    const baseExp = 100;
    // 仮の数式: 100 * (レベル ^ 1.2)
    return Math.floor(baseExp * Math.pow(level, 1.2));
};

// 獲得経験値を処理し、新しいレベルと残り経験値を返す関数
export const calculateLevelUp = (currentLevel: number, currentExp: number, gainedExp: number) => {
    let level = currentLevel;
    let exp = currentExp + gainedExp;

    let requiredExp = getRequiredExp(level);

    // 経験値が必要値を超えている限り、何度でもレベルアップ（ループ）
    while (exp >= requiredExp) {
        exp -= requiredExp;
        level += 1;
        requiredExp = getRequiredExp(level);
    }

    // レベルアップしたかどうかを判定フラグとして返す（フロントでの演出用）
    const isLevelUp = level > currentLevel;

    return { newLevel: level, newExp: exp, isLevelUp };
};