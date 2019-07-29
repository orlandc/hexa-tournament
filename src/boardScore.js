const Graph = require('node-dijkstra');
const transpose = require('./transposeHex');

let cache = {};

function boardScore(board, player) {
    let path0 = boardPath(board);
    let score = 0;
    if (!path0) {
        score = -(board.length * board.length);
    }else {
        if (path0.length === 2) {
            score = (board.length * board.length); 
        } else {
            let path1 = boardPath(transpose(board));
            if (!path1) {
                score =  (board.length * board.length)
            } else {
                score = path1.length - path0.length;
            }
        }
    }
    
    return player === '1' ? score: -score;
}

function boardPath(board) {
    let player = '1';
    let size = board.length;

    const route = new Graph();

    let neighborsT = {};
    let neighborsX = {};
    cache = {};
    // Build the graph out of the hex board
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let key = i * size + j;
            if (board[i][j] === 0) { // || board[i][j] === player
                let list = getNeighborhood(key, player, board);
                let neighbors = {};
                let sideX = false;
                let sideT = false;
                list.forEach(x => {
                    switch (x) {
                        case -1:
                            neighbors[player + 'X'] = 1;
                            neighborsX[key + ''] = 1;
                            sideX = sideX || board[i][j] === player;
                            break;
                        case -2:
                            neighbors[player + 'T'] = 1;
                            neighborsT[key + ''] = 1;
                            sideT = sideT || board[i][j] === player;
                            break;
                        default:
                            neighbors[x + ''] = 1;
                    }
                });
                // This case occurs when the game has finished
                if (sideT && sideX) {
                    neighborsX[player + 'T'] = 1;
                    neighborsT[player + 'X'] = 1;
                }
                route.addNode(key + '', neighbors);
            }
        }
    }

    route.addNode(player + 'T', neighborsT);
    route.addNode(player + 'X', neighborsX);

    return route.path(player + 'T', player + 'X');
}

/**
 * Return an array of the neighbors of the currentHex that belongs to the same player. The 
 * array contains the id of the hex. id = row * size + col
 * @param {Number} currentHex 
 * @param {Number} player 
 * @param {Matrix} board 
 */
function getNeighborhood(currentHex, player, board) {
    //Check if this value has been precalculated in this turn
    if (cache[currentHex + player]) {
        //console.log("Returned from cache");
        return cache[currentHex + player];
    }

    let size = board.length;
    let row = Math.floor(currentHex / size);
    let col = currentHex % size;
    let result = [];
    let currentValue = board[row][col];
    board[row][col] = 'x';
    // Check the six neighbours of the current hex
    pushIfAny(result, board, player, row - 1, col);
    pushIfAny(result, board, player, row - 1, col + 1);
    pushIfAny(result, board, player, row, col + 1);
    pushIfAny(result, board, player, row, col - 1);
    pushIfAny(result, board, player, row + 1, col);
    pushIfAny(result, board, player, row + 1, col - 1);

    // Add the edges if hex is at the border
    if (col === size - 1) {
        result.push(-1);
    } else if (col === 0) {
        result.push(-2);
    }

    board[row][col] = currentValue;

    // Cache this result
    cache[currentHex +  player] = result;

    return result;
}

function pushIfAny(result, board, player, row, col) {
    let size = board.length;
    if (row >= 0 && row < size && col >= 0 && col < size) {
        if (board[row][col] === player || board[row][col] === 0) {
            if (board[row][col] === player) {
                result.push(...getNeighborhood(col + row * size, player, board));
            } else {
                result.push(col + row * size);
            }
        }
    }
}

module.exports = boardScore;
/*
board = [[0, 0, 0],
[0, '2', 0],
['1', '1', 0]];
console.log(boardScore(board, '1'));  // Debe dar 3 - 1 = 2

board = [[0, 0, '1'],
[0, '2', 0],
['1', 0, 0]];
console.log(boardScore(board, '1'));  // Debe dar 3 - 1 = 2

/*let board = [[0, '1', '1'],
['2', '2', '2'],
[0, 0, 0]];
console.log(boardScore(board, '2'));*/

/* = [[0, '1', '1'],
['2', '2', '2'],
[0, 0, 0]];
console.log(boardScore(board, '1'));*/
/*
let board = [[0, '2', '2'],
['1', '1', '1'],
[0, 0, 0]];
console.log(boardScore(board, '1'));

board = [[0, '2', '2'],
['1', '1', '1'],
[0, 0, 0]];
console.log(boardScore(board, '2'));

board = [[0, '2', '2'],
['1', '1', '2'],
[0, 0, '2']];
console.log(boardScore(board, '1'));

board = [[0, '2', '2'],
['1', '1', '2'],
[0, 0, '2']];
console.log(boardScore(board, '2'));
*/
/*let board = [['1', '1', '2'], 
             [0,   '2', 0], 
             [0,    0,  0]];
console.log(boardScore(board, '2'));

    board = [['1', '1', 0], 
             [0,   '2', '2'], 
             [0,    0,  0]];
console.log(boardScore(board, '2'));*/
