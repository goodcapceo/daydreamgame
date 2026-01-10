import React from 'react';
import { WORLD4_LEVELS } from './levels';
import { useMatch3Logic } from './useMatch3Logic';
import { useGameState } from '../../engine/GameStateProvider';

const TILE_SIZE = 50;
const TILE_COLORS = { pink: 'var(--w4-flower-pink)', purple: 'var(--w4-flower-purple)', yellow: 'var(--w4-flower-yellow)' };

const EnchantedGarden = ({ levelId }) => {
  const { completeLevel, failLevel, setShowPauseMenu } = useGameState();
  const levelData = WORLD4_LEVELS.find(l => l.id === levelId);
  const { grid, selected, score, moves, collected, handleTileClick } = useMatch3Logic(levelData, completeLevel, failLevel);

  return (
    <div className="absolute-fill flex-center flex-col" style={{ background: 'var(--w4-bg-gradient)' }}>
      <div className="absolute top-0 left-0 right-0 flex-between p-4" style={{ zIndex: 'var(--z-ui-overlay)' }}>
        <button className="btn-icon" onClick={() => setShowPauseMenu(true)}>⏸</button>
        <div className="glass-panel flex gap-3 px-4 py-2">
          <span className="text-body">🎯 {score}</span>
          <span className="text-body">✨ {moves}</span>
        </div>
        <div style={{ width: '44px' }} />
      </div>

      {levelData.objective.type === 'collect' && (
        <div className="glass-panel flex gap-3 px-4 py-2 mb-4" style={{ marginTop: '70px' }}>
          {Object.entries(levelData.objective.targets).map(([type, target]) => (
            <div key={type} className="flex items-center gap-1">
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: TILE_COLORS[type] }} />
              <span className="text-body text-sm">{collected[type]}/{target}</span>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel-strong p-2" style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, ${TILE_SIZE}px)`, gap: 4, marginTop: levelData.objective.type === 'score' ? '80px' : '10px' }}>
        {grid.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleTileClick(rowIndex, colIndex)}
                className="transition-transform"
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  borderRadius: 'var(--radius-md)',
                  background: tile ? TILE_COLORS[tile] : 'transparent',
                  border: isSelected ? '3px solid var(--color-white)' : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: isSelected ? '0 0 15px rgba(255,255,255,0.5)' : 'none',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(0.95)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {tile === 'pink' && '🌸'}
                {tile === 'purple' && '🦋'}
                {tile === 'yellow' && '🌼'}
              </button>
            );
          })
        )}
      </div>
      <p className="absolute bottom-8 text-small text-center opacity-70">Tap to select, tap adjacent to swap</p>
    </div>
  );
};

export default EnchantedGarden;
