import { useState } from "react";

function Square({ value, onSquareClick, isWinnerSquare }) {
  return (
    <button className={isWinnerSquare ? "winner-square" : "square"} onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const boardSize = 3;

  function renderSquare(row, col) {
    const index = row * boardSize + col;
    const isWinnerSquare = winnerLine && winnerLine.includes(index);

    return (
      <Square
        key={index}
        value={squares[index]}
        onSquareClick={() => handleClick(index, row, col)}
        isWinnerSquare={isWinnerSquare}
      />
    );
  }

  function renderRow(row) {
    const rowSquares = [];
    for (let col = 0; col < boardSize; col++) {
      rowSquares.push(renderSquare(row, col));
    }
    return <div className="board-row" key={row}>{rowSquares}</div>;
  }

  function handleClick(i, row, col) {
    // Makes the visualization of the coordinates for the user, instead of the index of the squares array
    row = row + 1;
    col = col + 1;

    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }

    onPlay(nextSquares, row, col);
  }

  const { winner, line: winnerLine } = calculateWinner(squares) || {};
  const isDraw = squares.every((square) => square !== null) && !winner;
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const boardRows = [];
  for (let row = 0; row < boardSize; row++) {
    boardRows.push(renderRow(row));
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), coordinates: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sortAscending, setSortAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const current = history[currentMove];

  function handlePlay(nextSquares, row, col) {
    const nextHistory = history.slice(0, currentMove + 1);
    const newMove = { squares: nextSquares, coordinates: { row, col } };
    setHistory([...nextHistory, newMove]);
    setCurrentMove(nextHistory.length);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((move, moveNumber) => {
    const step = sortAscending ? moveNumber : history.length - 1 - moveNumber;
    let description;

    if (step === 0) {
      description = 'Go to game start';
    } else if (move.coordinates) {
      description = `Go to move #${step} (${move.coordinates.row}, ${move.coordinates.col})`;
    } else {
      description = `Go to move #${step}`;
    }

    return (
      <li key={step}>
        {step === currentMove ? (
          <>You are at move #{step}</>
        ) : (
          <button onClick={() => jumpTo(step)}>{description}</button>
        )}
      </li>
    );
  });

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={current.squares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={toggleSort}>
          Sort Order: {sortAscending ? 'Ascending' : 'Descending'}
        </button>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: [a, b, c]
      }
    }
  }
  return null;
}