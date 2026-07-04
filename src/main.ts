import { startGame } from './game/main.js';

const parent = document.getElementById('game-root');
if (!parent) {
  throw new Error('CCRPG: #game-root element missing from index.html');
}

startGame(parent).catch((err) => {
  console.error('CCRPG failed to boot:', err);
});
