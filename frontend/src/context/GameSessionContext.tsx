import React, { createContext, useContext, useMemo, useState } from 'react';

interface GameSessionContextValue {
  gameTime: number;
  addGameTime: (minutes: number) => void;
}

const GameSessionContext = createContext<GameSessionContextValue | undefined>(undefined);

export function GameSessionProvider({ children }: { children: React.ReactNode }) {
  const [gameTime, setGameTime] = useState(0);

  const value = useMemo(
    () => ({
      gameTime,
      addGameTime: (minutes: number) => setGameTime((prev) => prev + minutes),
    }),
    [gameTime],
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}

export function useGameSession() {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within GameSessionProvider');
  }

  return context;
}
