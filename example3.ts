import * as readline from 'readline';

type Position = {
  x: number;
  y: number;
};

const maze: string[][] = [
  [' ', ' ', ' ', '*', ' ', ' ', ' '],
  ['*', '*', ' ', '*', ' ', '*', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', ' '],
  [' ', '*', '*', '*', '*', '*', ' '],
  [' ', ' ', ' ', ' ', ' ', ' ', 'E'], // Exit
];

let playerPosition: Position = { x: 0, y: 0 }; // Starting position

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function printMaze(): void {
  maze.forEach((row, y) => {
    let rowStr: string = '';
    row.forEach((cell, x) => {
      if (playerPosition.x === x && playerPosition.y === y) {
        rowStr += 'P ';
      } else {
        rowStr += cell + ' ';
      }
    });
    console.log(rowStr);
  });
}

function movePlayer(direction: string): boolean {
  let newX = playerPosition.x;
  let newY = playerPosition.y;

  switch (direction) {
    case 'w': newY -= 1; break;
    case 's': newY += 1; break;
    case 'a': newX -= 1; break;
    case 'd': newX += 1; break;
    default: console.log('Invalid direction! Use w, a, s, d to move.'); return false;
  }

  if (newX >= 0 && newX < maze[0].length && newY >= 0 && newY < maze.length && maze[newY][newX] !== '*') {
    playerPosition = { x: newX, y: newY };
    return true;
  } else {
    console.log('Move blocked by a wall!');
    return false;
  }
}

function checkWin(): boolean {
  return maze[playerPosition.y][playerPosition.x] === 'E';
}

function askForMove(): void {
  rl.question('Your move (w, a, s, d): ', (answer) => {
    if (movePlayer(answer)) {
      printMaze();
      if (checkWin()) {
        console.log('Congratulations, you found the exit!');
        rl.close();
      } else {
        askForMove();
      }
    } else {
      askForMove();
    }
  });
}

console.log('Find your way to the exit! Use w (up), s (down), a (left), d (right) to move.');
printMaze();
askForMove();
