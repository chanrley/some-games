class SudokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
        this.difficulty = 'medium';
        
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.newGame();
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = Math.floor(i / 9);
            cell.dataset.col = i % 9;
            cell.addEventListener('click', () => this.selectCell(i));
            boardElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('checkGame').addEventListener('click', () => this.checkGame());
        document.getElementById('solveGame').addEventListener('click', () => this.solveGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                if (number === 0) {
                    this.clearCell();
                } else {
                    this.inputNumber(number);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.inputNumber(parseInt(e.key));
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                this.clearCell();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                       e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.moveSelection(e.key);
            }
        });
    }

    selectCell(index) {
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        if (this.initialBoard[row][col] !== 0) {
            return;
        }

        this.selectedCell = { row, col };
        this.updateCellStyles();
    }

    updateCellStyles() {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            cell.className = 'cell';

            if (this.initialBoard[row][col] !== 0) {
                cell.classList.add('prefilled');
            } else if (this.board[row][col] !== 0) {
                cell.classList.add('user-input');
            }

            if (this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col) {
                cell.classList.add('selected');
            }
        });
    }

    inputNumber(number) {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        if (this.initialBoard[row][col] !== 0) return;

        this.board[row][col] = number;
        this.updateDisplay();
        this.updateCellStyles();
        this.clearMessage();

        if (this.isComplete()) {
            this.stopTimer();
            this.showMessage('Parabéns! Você completou o Sudoku!', 'success');
        }
    }

    clearCell() {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        if (this.initialBoard[row][col] !== 0) return;

        this.board[row][col] = 0;
        this.updateDisplay();
        this.updateCellStyles();
    }

    moveSelection(key) {
        if (!this.selectedCell) {
            this.selectedCell = { row: 0, col: 0 };
        } else {
            const { row, col } = this.selectedCell;
            switch (key) {
                case 'ArrowUp':
                    this.selectedCell.row = row > 0 ? row - 1 : 8;
                    break;
                case 'ArrowDown':
                    this.selectedCell.row = row < 8 ? row + 1 : 0;
                    break;
                case 'ArrowLeft':
                    this.selectedCell.col = col > 0 ? col - 1 : 8;
                    break;
                case 'ArrowRight':
                    this.selectedCell.col = col < 8 ? col + 1 : 0;
                    break;
            }
        }
        this.updateCellStyles();
    }

    updateDisplay() {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.board[row][col];
            cell.textContent = value !== 0 ? value : '';
        });
    }

    isValid(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num) {
                return false;
            }
        }

        const startRow = row - (row % 3);
        const startCol = col - (col % 3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    solve(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solve(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    generateFullBoard() {
        const board = Array(9).fill().map(() => Array(9).fill(0));
        
        for (let i = 0; i < 30; i++) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            const num = Math.floor(Math.random() * 9) + 1;
            
            if (board[row][col] === 0 && this.isValid(board, row, col, num)) {
                board[row][col] = num;
            }
        }

        this.solve(board);
        return board;
    }

    removeNumbers(board, difficulty) {
        const cellsToRemove = {
            easy: 35,
            medium: 45,
            hard: 55
        };

        const puzzle = board.map(row => [...row]);
        let removed = 0;
        const toRemove = cellsToRemove[difficulty];

        while (removed < toRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (puzzle[row][col] !== 0) {
                puzzle[row][col] = 0;
                removed++;
            }
        }

        return puzzle;
    }

    newGame() {
        this.stopTimer();
        this.selectedCell = null;
        this.timer = 0;
        this.clearMessage();
        
        const fullBoard = this.generateFullBoard();
        this.solution = fullBoard.map(row => [...row]);
        this.initialBoard = this.removeNumbers(fullBoard, this.difficulty);
        this.board = this.initialBoard.map(row => [...row]);
        
        this.updateDisplay();
        this.updateCellStyles();
        this.startTimer();
    }

    checkGame() {
        let hasErrors = false;
        document.querySelectorAll('.cell').forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.board[row][col];
            
            cell.classList.remove('error', 'correct');
            
            if (value !== 0) {
                if (value === this.solution[row][col]) {
                    cell.classList.add('correct');
                } else {
                    cell.classList.add('error');
                    hasErrors = true;
                }
            }
        });

        if (!hasErrors && this.isComplete()) {
            this.showMessage('Parabéns! Você completou o Sudoku corretamente!', 'success');
            this.stopTimer();
        } else if (!hasErrors) {
            this.showMessage('Tudo certo até agora! Continue assim!', 'info');
        } else {
            this.showMessage('Existem alguns erros. Tente novamente!', 'error');
        }
    }

    solveGame() {
        this.board = this.solution.map(row => [...row]);
        this.updateDisplay();
        this.updateCellStyles();
        this.stopTimer();
        this.showMessage('Sudoku resolvido!', 'info');
    }

    isComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    startTimer() {
        this.timer = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
    }

    clearMessage() {
        const messageElement = document.getElementById('message');
        messageElement.textContent = '';
        messageElement.className = 'message';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});

