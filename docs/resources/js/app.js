/**
 *
 * Copyright (c) 2020 Alexander Bazhanov
 * https://github.com/bazhanius/
 *
 */

let gameState;

function ready() {

    let buttonClicks = document.querySelectorAll('.game-menu-option');
    buttonClicks.forEach( (x) => {
        x.addEventListener("click", function(e) {
            document.documentElement.style.setProperty('--clickX', `${e.clientX}px`);
            document.documentElement.style.setProperty('--clickY', `${e.clientY}px`);
        });
    });

    function resizeWindow() {
        document.documentElement.style.setProperty('height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('width', `${window.innerWidth}px`);
    }

    // We listen to the resize event
    window.addEventListener('resize', () => {
        resizeWindow();
    });

    resizeWindow();

    let resultScreenInput = document.querySelector('.input-container__input');
    let btnSave = document.querySelector('#save');

    let btnStart = document.querySelector('#start');

    let gameMetrics = document.querySelector('.game-metrics');

    let btnClose = document.querySelector('.x-close');

    let countdownScreen = document.querySelector('.countdown');
    let countdownScreenDigits = document.querySelectorAll('.countdown__digit');
    let mainScreen = document.querySelector('.main-menu-screen');

    let gameScreen = document.querySelector('.game-screen');

    let btnScores = document.querySelector('#scores');
    let scoresScreen = document.querySelector('.scores-screen');

    let transitionScreen = document.querySelector('.transition-screen');
    let transitionScreenCircle = document.querySelector('.circle');

    let resultScreen = document.querySelector('.result-screen');

    let results = {};

    // Preview board animation
    let previewBoard = {
        matrix: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0],
        emptyPos: 15,
        animatePreview() {
            let possibleMoves = [];
            let emptyX = this.emptyPos % 4;
            let emptyY = Math.floor(this.emptyPos / 4);
            
            // Check all adjacent positions
            if (emptyX > 0) possibleMoves.push(this.emptyPos - 1); // left
            if (emptyX < 3) possibleMoves.push(this.emptyPos + 1); // right
            if (emptyY > 0) possibleMoves.push(this.emptyPos - 4); // up
            if (emptyY < 3) possibleMoves.push(this.emptyPos + 4); // down
            
            // Pick random move
            let movePos = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            // Swap in matrix
            this.matrix[this.emptyPos] = this.matrix[movePos];
            this.matrix[movePos] = 0;
            
            // Update DOM
            let tileNum = this.matrix[this.emptyPos];
            if (tileNum > 0) {
                let tiles = document.querySelectorAll('.preview-tile');
                tiles.forEach(tile => {
                    if (parseInt(tile.textContent) === tileNum) {
                        let newX = this.emptyPos % 4;
                        let newY = Math.floor(this.emptyPos / 4);
                        tile.style.transform = `translate(calc((var(--tile-width) * 0.6 + 5px) * ${newX}), calc((var(--tile-width) * 0.6 + 5px) * ${newY}))`;
                    }
                });
            }
            
            this.emptyPos = movePos;
        }
    };

    let results = {};

    gameState = {
        interval: null,
        previewInterval: null,
        mainMenu() {
            clearInterval(gameState.interval);
            clearInterval(gameState.previewInterval);
            mainScreen.style.display = 'flex';
            gameScreen.style.display = 'flex';
            resultScreen.style.display = 'none';
            countdownScreen.style.display = 'none';
            scoresScreen.style.display = 'none';
            btnClose.style.display = 'none';
            gameMetrics.classList.add('hidden');
            gameState.interval = setInterval(function() {
                field.shuffle(1);
            }, 2000);
            gameState.previewInterval = setInterval(function() {
                previewBoard.animatePreview();
            }, 800);
        },
        readyCheck() {
            clearInterval(gameState.interval);
            clearInterval(gameState.previewInterval);
            mainScreen.style.display = 'none';
            countdownScreen.style.display = 'flex';
            countdownScreenDigits.forEach( (x) => {
               x.classList.add('digit__anim-fly-in');
            });
            gameState.interval = setInterval(function(){
                field.shuffle();
            }, 3890);
            setTimeout(function(){
                clearInterval(gameState.interval);
                gameState.play();
                countdownScreenDigits.forEach( (x) => {
                    x.classList.remove('digit__anim-fly-in');
                });
            }, 4000);
        },
        play() {
            actions.keyEvents.init();
            actions.clickOnCubes.init();
            counters.seconds.start();
            counters.moves.reset();
            clearInterval(this.interval);
            btnClose.style.display = 'block';
            gameMetrics.classList.remove('hidden');
            mainScreen.style.display = 'none';
            countdownScreen.style.display = 'none';
        },
        theEnd() {
            actions.keyEvents.destroy();
            actions.clickOnCubes.destroy();
            results = {
                'moves': counters.moves.value,
                'time': counters.seconds.getTime()
            };
            confetti.start(3000, 100, 150);
            resultScreen.style.display = 'flex';
            //counters.moves.reset();
            counters.seconds.stop();
        },
        submitResult(nickname) {
            let el = document.getElementById("confetti-canvas");
            if (el) el.parentNode.removeChild(el);
            counters.results.add(nickname, results.moves, results.time);
        },
        transition(type) {
            transitionScreen.style.display = 'flex';
            transitionScreenCircle.classList.add('circle__fly-in');
            setTimeout(function(){
                transitionScreenCircle.classList.remove('circle__fly-in');
                transitionScreenCircle.classList.add('circle__fly-out');
                if (type === 'toMainMenu') gameState.mainMenu();
                if (type === 'toPlay') gameState.readyCheck();
                if (type === 'toScores') gameState.scores();
            }, 750);
            setTimeout(function(){
                transitionScreenCircle.classList.remove('circle__fly-out');
                transitionScreen.style.display = 'none';
            }, 1500);
        },
        reset() {
            field.reset();
            counters.seconds.stop();
            counters.moves.reset();
        },
        scores() {
            btnClose.style.display = 'block';
            scoresScreen.style.display = 'flex';
            gameScreen.style.display = 'none';
            mainScreen.style.display = 'none';
            resultScreen.style.display = 'none';
        },
        about() {
            //
        }
    };

    resultScreenInput.onfocus = function() {
        let el = document.getElementById("confetti-canvas");
        if (el) el.parentNode.removeChild(el);
    };

    btnSave.onclick = function() {
        gameState.submitResult(resultScreenInput.value);
        gameState.transition('toScores');
    };

    btnStart.onclick = function() {
        gameState.transition('toPlay');
    };

    btnScores.onclick = function() {
        gameState.transition('toScores');
    };

    btnClose.onclick = function() {
        actions.keyEvents.destroy();
        actions.clickOnCubes.destroy();
        gameState.transition('toMainMenu');
    };

    /* Init App */
    actions.dragField.init();
    gameState.mainMenu();
    counters.results.updateHTML('byMoves');

}

document.addEventListener("DOMContentLoaded", ready);