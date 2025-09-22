// オセロ
import React, { useState, useEffect } from "react";

const BOARD_SIZE = 6;
type Stone = 0 | 1 | 2; // 0:空, 1:ユーザー(黒), 2:AI(白)

const initialBoard = (): Stone[][] => {
  const board: Stone[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0),
  );
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = 2;
  board[mid][mid] = 2;
  board[mid - 1][mid] = 1;
  board[mid][mid - 1] = 1;
  return board;
};

const directions = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function getFlips(
  board: Stone[][],
  x: number,
  y: number,
  color: Stone,
): [number, number][] {
  if (board[x][y] !== 0) return [];
  const flips: [number, number][] = [];
  for (const [dx, dy] of directions) {
    let nx = x + dx,
      ny = y + dy;
    const temp: [number, number][] = [];
    while (
      nx >= 0 &&
      nx < BOARD_SIZE &&
      ny >= 0 &&
      ny < BOARD_SIZE &&
      board[nx][ny] !== 0 &&
      board[nx][ny] !== color
    ) {
      temp.push([nx, ny]);
      nx += dx;
      ny += dy;
    }
    if (
      temp.length > 0 &&
      nx >= 0 &&
      nx < BOARD_SIZE &&
      ny >= 0 &&
      ny < BOARD_SIZE &&
      board[nx][ny] === color
    ) {
      flips.push(...temp);
    }
  }
  return flips;
}

function getValidMoves(board: Stone[][], color: Stone): [number, number][] {
  const moves: [number, number][] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      if (getFlips(board, x, y, color).length > 0) {
        moves.push([x, y]);
      }
    }
  }
  return moves;
}

function getRandomMove(
  board: Stone[][],
  color: Stone,
): [number, number] | null {
  const moves = getValidMoves(board, color);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

interface OthelloProps {
  onLose: () => void;
}

const Othello: React.FC<OthelloProps> = ({ onLose }) => {
  const [board, setBoard] = useState<Stone[][]>(initialBoard());
  const [turn, setTurn] = useState<Stone>(1); // 1:ユーザー, 2:AI
  const [message, setMessage] = useState<string>("あなたの番です");
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);

  useEffect(() => {
    const userMoves = getValidMoves(board, 1);
    const aiMoves = getValidMoves(board, 2);
    if (userMoves.length === 0 && aiMoves.length === 0) {
      setGameOver(true);
      const flat = board.flat();
      const userCount = flat.filter((s) => s === 1).length;
      const aiCount = flat.filter((s) => s === 2).length;
      if (userCount > aiCount) {
        setMessage("ロボットの疑いがあります。");
        setIsWin(true);
      } else if (userCount < aiCount) {
        setMessage("あなたは人間です。(3秒後に遷移します)");
        setTimeout(onLose, 3000);
      } else {
        setMessage("引き分けです。");
      }
    } else if (turn === 2 && !gameOver) {
      if (aiMoves.length > 0) {
        setTimeout(() => {
          const move = getRandomMove(board, 2);
          if (move) {
            const [x, y] = move;
            const flips = getFlips(board, x, y, 2);
            const newBoard = board.map((row) => [...row]);
            newBoard[x][y] = 2;
            flips.forEach(([fx, fy]) => (newBoard[fx][fy] = 2));
            setBoard(newBoard);
            setTurn(1);
            setMessage("あなたの番です");
          }
        }, 700);
      } else {
        setTurn(1);
        setMessage("AIはパスしました。あなたの番です");
      }
    }
  }, [turn]);

  const handleCellClick = (x: number, y: number) => {
    if (gameOver || turn !== 1) return;
    const flips = getFlips(board, x, y, 1);
    if (flips.length === 0) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[x][y] = 1;
    flips.forEach(([fx, fy]) => (newBoard[fx][fy] = 1));
    setBoard(newBoard);
    setTurn(2);
    setMessage("AIの番です");
  };

  const userCount = board.flat().filter((s) => s === 1).length;
  const aiCount = board.flat().filter((s) => s === 2).length;

  return (
    <div>
      <div className="flex justify-center mb-2 gap-4">
        <span>あなた(●): {userCount}</span>
        <span>AI(○): {aiCount}</span>
      </div>
      <div className="flex flex-col items-center">
        {board.map((row, x) => (
          <div key={x} className="flex">
            {row.map((cell, y) => (
              <button
                key={y}
                className={`w-8 h-8 border border-gray-400 flex items-center justify-center text-2xl
                  ${cell === 0 && turn === 1 && getFlips(board, x, y, 1).length > 0 ? "bg-green-100 hover:bg-green-300" : "bg-white"}
                  ${cell !== 0 ? "cursor-default" : "cursor-pointer"}
                `}
                onClick={() => handleCellClick(x, y)}
                disabled={
                  cell !== 0 ||
                  turn !== 1 ||
                  gameOver ||
                  getFlips(board, x, y, 1).length === 0
                }
                aria-label={`cell-${x}-${y}`}
              >
                {cell === 1 ? "●" : cell === 2 ? "○" : ""}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="text-center mt-2">{message}</div>
      {/* パスボタン */}
      {turn === 1 && getValidMoves(board, 1).length === 0 && !gameOver && (
        <button
          className="mt-4 w-full rounded bg-yellow-500 text-white py-2 font-semibold"
          onClick={() => {
            setTurn(2);
            setMessage("あなたはパスしました。AIの番です");
          }}
        >
          パス
        </button>
      )}
      {gameOver && isWin && (
        <button
          className="mt-4 w-full rounded bg-blue-600 text-white py-2 font-semibold"
          onClick={() => {
            setBoard(initialBoard());
            setTurn(1);
            setGameOver(false);
            setMessage("あなたの番です");
            setIsWin(false);
          }}
        >
          もう一度遊ぶ
        </button>
      )}
    </div>
  );
};

export default Othello;
