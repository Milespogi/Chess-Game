const board = document.getElementById('chess-board');
let selectedSquare = null;

// Unicode pieces mapping
const pieces = {
    r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
    R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

// Initial board state
let gameState = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
];

function renderBoard() {
    board.innerHTML = ''; // Clear board
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            const isLight = (r + c) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.dataset.row = r;
            square.dataset.col = c;

            const piece = gameState[r][c];
            if (piece) {
                square.textContent = pieces[piece];
                square.classList.add(piece === piece.toUpperCase() ? 'white-p' : 'black-p');
            }

            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
        }
    }
}

function handleSquareClick(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const piece = gameState[row][col];

    // 1. SELECTING A PIECE
    if (!selectedSquare && piece) {
        selectedSquare = { row, col, piece };
        e.target.classList.add('selected');
        return;
    }

    // 2. MOVING TO A NEW SQUARE
    if (selectedSquare) {
        // Here is where you would normally send data to your LAN Server:
        // socket.send(JSON.stringify({from: selectedSquare, to: {row, col}}));
        
        // FOR NOW: Local Simulation
        executeMove(selectedSquare.row, selectedSquare.col, row, col);
        
        selectedSquare = null;
        renderBoard();
    }
}

function executeMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState[fromRow][fromCol];
    gameState[toRow][toCol] = piece; // Place piece at destination
    gameState[fromRow][fromCol] = ''; // Remove from original spot
    
    // Log for your move history
    const moveLog = document.getElementById('move-list');
    const li = document.createElement('li');
    li.textContent = `Moved ${piece} to [${toRow},${toCol}]`;
    moveLog.appendChild(li);
}

renderBoard();
function handleSquareClick(e) {
    const row = parseInt(e.currentTarget.dataset.row);
    const col = parseInt(e.currentTarget.dataset.col);
    const piece = gameState[row][col];

    if (!selectedSquare && piece) {
        // Only select if it's a piece
        selectedSquare = { row, col, piece };
        e.currentTarget.classList.add('selected');
    } else if (selectedSquare) {
        // Check if the move is valid for a Pawn
        if (isValidMove(selectedSquare, row, col)) {
            executeMove(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            renderBoard();
        } else {
            // Invalid move: deselect
            alert("Invalid Pawn Move!");
            selectedSquare = null;
            renderBoard();
        }
    }
}

function isValidMove(from, toRow, toCol) {
    const piece = from.piece.toLowerCase();
    const isWhite = from.piece === from.piece.toUpperCase();
    const rowDiff = toRow - from.row;
    const colDiff = Math.abs(toCol - from.col);

    // PAWN LOGIC
    if (piece === 'p') {
        // Pawns only move in their own column (unless capturing, but we'll keep it simple)
        if (colDiff !== 0) return false;

        if (isWhite) {
            // White Pawn (Moves Up: negative row change)
            if (rowDiff === -1) return true; // Standard 1-tile move
            if (from.row === 6 && rowDiff === -2) return true; // Initial 2-tile move
        } else {
            // Black Pawn (Moves Down: positive row change)
            if (rowDiff === 1) return true; // Standard 1-tile move
            if (from.row === 1 && rowDiff === 2) return true; // Initial 2-tile move
        }
        return false;
    }

    // For other pieces (Rooks, Knights, etc.), we'll allow all moves for now
    return true; 
}
function isValidMove(from, toRow, toCol) {
    const rDiff = toRow - from.row;
    const cDiff = toCol - from.col;
    const absR = Math.abs(rDiff);
    const absC = Math.abs(cDiff);
    const piece = from.piece.toLowerCase();
    const target = gameState[toRow][toCol];

    // Basic Rule: Cannot capture your own piece
    if (target !== '' && isSameTeam(from.piece, target)) return false;

    switch (piece) {
        case 'p': // Pawn
            const dir = (from.piece === 'P') ? -1 : 1; // White moves up (-1), Black moves down (+1)
            // Forward 1
            if (cDiff === 0 && rDiff === dir && target === '') return true;
            // Forward 2 (Initial move)
            const startRow = (from.piece === 'P') ? 6 : 1;
            if (cDiff === 0 && rDiff === 2 * dir && from.row === startRow && target === '') return true;
            // Capture
            if (absC === 1 && rDiff === dir && target !== '') return true;
            return false;

        case 'r': // Rook
            return (rDiff === 0 || cDiff === 0) && !isPathBlocked(from, toRow, toCol);

        case 'n': // Knight
            return (absR === 2 && absC === 1) || (absR === 1 && absC === 2);

        case 'b': // Bishop
            return (absR === absC) && !isPathBlocked(from, toRow, toCol);

        case 'q': // Queen
            return (rDiff === 0 || cDiff === 0 || absR === absC) && !isPathBlocked(from, toRow, toCol);

        case 'k': // King
            return (absR <= 1 && absC <= 1);

        default: return false;
    }
}
function isPathBlocked(from, toRow, toCol) {
    let currR = from.row + Math.sign(toRow - from.row);
    let currC = from.col + Math.sign(toCol - from.col);

    while (currR !== toRow || currC !== toCol) {
        if (gameState[currR][currC] !== '') return true; // Path is blocked!
        if (currR !== toRow) currR += Math.sign(toRow - currR);
        if (currC !== toCol) currC += Math.sign(toCol - currC);
    }
    return false;
}
// State management
let currentTurn = 'W'; // 'W' for White, 'B' for Black
let playerColor = 'W'; // In LAN, one client will be 'W', the other 'B'

function handleSquareClick(e) {
    const row = parseInt(e.currentTarget.dataset.row);
    const col = parseInt(e.currentTarget.dataset.col);
    const piece = gameState[row][col];

    // 1. PREVENT MOVING OUT OF TURN
    if (!selectedSquare) {
        if (!piece) return; // Clicked empty square
        
        const isWhitePiece = piece === piece.toUpperCase();
        const pieceColor = isWhitePiece ? 'W' : 'B';

        if (pieceColor !== currentTurn) {
            alert("It is not your turn!");
            return;
        }

        selectedSquare = { row, col, piece };
        e.currentTarget.classList.add('selected');
    } 
    // 2. TRYING TO MOVE
    else {
        if (isValidMove(selectedSquare, row, col)) {
            executeMove(selectedSquare.row, selectedSquare.col, row, col);
            
            // SWAP TURNS
            currentTurn = (currentTurn === 'W') ? 'B' : 'W';
            updateTurnUI();
            
            selectedSquare = null;
            renderBoard();
        } else {
            selectedSquare = null;
            renderBoard();
        }
    }
}

function updateTurnUI() {
    const turnDisplay = document.getElementById('turn-display');
    turnDisplay.textContent = (currentTurn === 'W') ? "White's Turn" : "Black's Turn";
    
    // Optional: Change color of the indicator
    turnDisplay.style.background = (currentTurn === 'W') ? "#ecf0f1" : "#2c3e50";
    turnDisplay.style.color = (currentTurn === 'W') ? "#2c3e50" : "#ecf0f1";
}
function isSameTeam(piece1, piece2) {
    if (!piece1 || !piece2) return false;
    const isP1White = piece1 === piece1.toUpperCase();
    const isP2White = piece2 === piece2.toUpperCase();
    return isP1White === isP2White;
}
function executeMove(fromRow, fromCol, toRow, toCol) {
    const attacker = gameState[fromRow][fromCol];
    const victim = gameState[toRow][toCol];

    // Check if the King was "eaten"
    if (victim.toLowerCase() === 'k') {
        const winner = attacker === attacker.toUpperCase() ? "White" : "Black";
        
        // Use setTimeout so the board renders the final move before the alert pops up
        setTimeout(() => {
            alert(`GAME OVER! ${winner} has captured the King and wins!`);
            location.reload(); // Restarts the game
        }, 100);
    }

    // Standard move execution
    gameState[toRow][toCol] = attacker;
    gameState[fromRow][fromCol] = '';
    
    // Log the capture if it happened
    if (victim !== '') {
        updateMoveLog(`${attacker} captured ${victim}`);
    }
}
