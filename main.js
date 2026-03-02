console.log('BOWMASTER: main.js execution started');

// Global error listener to catch everything
window.onerror = function(msg, url, lineNo, columnNo, error) {
    const fallback = document.getElementById('loading-fallback');
    const message = `Error: ${msg}\nLine: ${lineNo}\nURL: ${url}`;
    console.error('BOWMASTER Global Error:', message, error);
    
    if (fallback) {
        fallback.innerHTML = `
            <div style="padding: 20px; background: rgba(255,0,0,0.2); border: 2px solid #ff4444; border-radius: 12px; max-width: 90%; word-break: break-all;">
                <h2 style="color: #ff4444; margin: 0 0 10px 0;">Fatal Error</h2>
                <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; margin-bottom: 20px;">${message}</pre>
                <button onclick="window.location.reload()" style="background: #00d2ff; color: #05070a; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Try Refreshing</button>
            </div>
        `;
    }
    return false;
};

import { Game } from './src/game.js';

const init = () => {
    console.log('BOWMASTER: Starting initialization...');
    const fallback = document.getElementById('loading-fallback');
    
    try {
        if (!document.getElementById('gameCanvas')) {
            throw new Error('Canvas element not found in DOM');
        }

        const game = new Game();
        window.game = game;
        console.log('BOWMASTER: Ready to play!');
        
        // Final check: if we are here, everything went well
        if (fallback) {
            fallback.style.opacity = '0';
            setTimeout(() => {
                fallback.style.display = 'none';
            }, 600);
        }
    } catch (error) {
        console.error('BOWMASTER Init Crash:', error);
        // Let window.onerror handle the display if we throw here
        throw error; 
    }
};

// Start ASAP
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
