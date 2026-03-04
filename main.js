import { Game } from './src/game.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const menuOverlay = document.getElementById('menu-overlay');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const hud = document.getElementById('hud');

    // Make canvas full screen natively
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const game = new Game(canvas);

    // Initial draw before game starts so it's not a black screen
    game.renderer.clear();
    game.renderer.drawEnvironment();
    game.renderer.drawBow(150, canvas.height / 2, 0, 0, false);

    const startGame = () => {
        menuOverlay.classList.add('hidden');
        gameOverOverlay.classList.add('hidden');
        hud.classList.remove('hidden');
        game.start();
    };

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Bind game over callback
    game.onGameOver = (score) => {
        document.getElementById('final-score-val').textContent = score;
        gameOverOverlay.classList.remove('hidden');
        hud.classList.add('hidden');
    };
});
