import React, { useState, useEffect, useRef } from "react";

const GRID_SIZE = 10;
const ENEMY_SPEED = 500;
const TOWER_RANGE = 2;
const CELL_SIZE = 48;

const PATH = Array.from({ length: GRID_SIZE }, (_, i) => [4, i]);

const createEnemy = (id) => ({
  id,
  positionIndex: 0,
  health: 3,
  alive: true,
});

export default function TowerDefense() {
  const [enemies, setEnemies] = useState([]);
  const [towers, setTowers] = useState([]);
  const [lives, setLives] = useState(5);
  const [money, setMoney] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const gameInterval = useRef(null);

  useEffect(() => {
    if (gameOver) return;
    let enemyId = 1;
    const spawn = setInterval(() => {
      setEnemies((prev) => [...prev, createEnemy(enemyId++)]);
    }, 2000);
    return () => clearInterval(spawn);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    gameInterval.current = setInterval(() => {
      setEnemies((currentEnemies) =>
        currentEnemies
          .map((enemy) => {
            if (!enemy.alive) return enemy;
            const nextIndex = enemy.positionIndex + 1;
            if (nextIndex >= PATH.length) {
              setLives((l) => {
                if (l - 1 <= 0) setGameOver(true);
                return l - 1;
              });
              return { ...enemy, alive: false };
            }
            return { ...enemy, positionIndex: nextIndex };
          })
          .filter((e) => e.alive)
      );
    }, ENEMY_SPEED);
    return () => clearInterval(gameInterval.current);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const shoot = setInterval(() => {
      setEnemies((currentEnemies) => {
        let updated = [...currentEnemies];
        towers.forEach(({ row, col }) => {
          let target = updated.find(({ positionIndex }) => {
            const [er, ec] = PATH[positionIndex];
            return Math.abs(er - row) <= TOWER_RANGE && Math.abs(ec - col) <= TOWER_RANGE;
          });
          if (target) {
            updated = updated.map((enemy) =>
              enemy.id === target.id ? { ...enemy, health: enemy.health - 1 } : enemy
            );
          }
        });
        const alive = [];
        updated.forEach((enemy) => {
          if (enemy.health <= 0) setMoney((m) => m + 10);
          else alive.push(enemy);
        });
        return alive;
      });
    }, 800);
    return () => clearInterval(shoot);
  }, [towers, gameOver]);

  const addTower = (r, c) => {
    if (gameOver) return;
    if (money < 50) return alert("Not enough money!");
    if (PATH.some(([pr, pc]) => pr === r && pc === c)) return alert("Can't place on path!");
    if (towers.some((t) => t.row === r && t.col === c)) return;
    setTowers([...towers, { row: r, col: c }]);
    setMoney((m) => m - 50);
  };

  const restartGame = () => {
    setEnemies([]);
    setTowers([]);
    setLives(5);
    setMoney(100);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white font-sans">
      <h1 className="text-3xl font-bold mb-2 text-emerald-400">Tower Defense</h1>
      <p className="mb-4 text-gray-300 text-sm">Place towers, defend the path, and stop the enemies!</p>

      <div className="mb-4 flex gap-6 text-lg">
        <span className="font-semibold text-emerald-400">❤️ Lives: {lives}</span>
        <span className="font-semibold text-yellow-400">💰 Money: ${money}</span>
      </div>

      <div
        className="grid border-4 border-gray-700 rounded-md shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
        }}
      >
        {Array.from({ length: GRID_SIZE }, (_, r) =>
          Array.from({ length: GRID_SIZE }, (_, c) => {
            const isPath = PATH.some(([pr, pc]) => pr === r && pc === c);
            const hasTower = towers.some((t) => t.row === r && t.col === c);
            const enemyHere = enemies.find(
              (e) => PATH[e.positionIndex][0] === r && PATH[e.positionIndex][1] === c
            );

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => addTower(r, c)}
                className={`flex items-center justify-center border border-gray-700 transition-all duration-200 ${
                  isPath ? "bg-gray-500" : "bg-green-700 hover:bg-green-600 cursor-pointer"
                }`}
                style={{ width: CELL_SIZE, height: CELL_SIZE }}
              >
                {hasTower && (
                  <div className="w-3/5 h-3/5 rounded-full bg-blue-500 border-2 border-cyan-300 animate-pulse" />
                )}
                {enemyHere && (
                  <div
                    className="w-4/5 h-4/5 rounded-full bg-red-600 border-2 border-yellow-400 animate-bounce"
                    title={`HP: ${enemyHere.health}`}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {gameOver && (
        <div className="mt-6 text-center">
          <h2 className="text-2xl text-red-500 font-bold mb-2">💀 Game Over</h2>
          <button
            onClick={restartGame}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-semibold transition-all duration-300 shadow-md"
          >
            Restart Game
          </button>
        </div>
      )}
    </div>
  );
}
