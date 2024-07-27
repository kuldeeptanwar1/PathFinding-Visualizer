const board = document.getElementById('board');
var cells;
let row, col;
var matrix;
let sourceCoordinate;
let targetCoordinate;

renderBoard();
function renderBoard(cellWidth = 22) {
    const root = document.documentElement;
    root.style.setProperty('--cell-width', `${cellWidth}px`);

    const availableHeight = window.innerHeight - document.querySelector('nav').offsetHeight - document.querySelector('.guide-bar').offsetHeight - document.querySelector('footer').offsetHeight;
    const availableWidth = window.innerWidth;

    row = Math.floor(availableHeight / cellWidth);
    col = Math.floor(availableWidth / cellWidth);

    board.innerHTML = '';
    cells = [];
    matrix = [];

    for (let i = 0; i < row; i++) {
        const rowArray = [];
        const rowElement = document.createElement('div');
        rowElement.classList.add('row');
        rowElement.setAttribute('id', `${i}`);
        for (let j = 0; j < col; j++) {
            const colElement = document.createElement('div');
            colElement.classList.add('col');
            colElement.setAttribute('id', `${i}-${j}`);
            cells.push(colElement);
            rowArray.push(colElement);
            rowElement.appendChild(colElement);
        }
        matrix.push(rowArray);
        board.appendChild(rowElement);
    }

    sourceCoordinate = set('source');
    targetCoordinate = set('target');
    boardInteraction(cells);
}

const navOptions = document.querySelectorAll('.nav-menu>li>a');
let dropOptions = null;

const removeActive = (elements, parent = false) => {
    elements.forEach(element => {
        if (parent) {
            element = element.parentElement;
        }
        element.classList.remove('active');
    })
}

navOptions.forEach(navOption => {
    navOption.addEventListener('click', () => {
        const li = navOption.parentElement;
        if (li.classList.contains('active')) {
            li.classList.remove('active');
            return;
        }
        removeActive(navOptions, true);
        li.classList.add('active');

        if (li.classList.contains('drop-box')) {
            dropOptions = li.querySelectorAll('.drop-menu>li');
            toggle_dropOptions(navOption.innerText);
        }
    })
})

let pixelSize = 22;
let algorithm = 'BFS';
const visualizeBtn = document.getElementById('visualize');

function toggle_dropOptions(target) {
    dropOptions.forEach(dropOption => {
        dropOption.addEventListener('click', () => {
            removeActive(dropOptions);
            dropOption.classList.add('active');
            if (target === 'Pixel') {
                pixelSize = +dropOption.innerText.replace('px', '');
                renderBoard(pixelSize);
            } else {
                algorithm = dropOption.innerText.split(' ')[0];
                visualizeBtn.innerText = `Visualize ${algorithm}`;
            }
            removeActive(navOptions, true);
        })
    })
}

document.addEventListener('click', (e) => {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu.contains(e.target)) {
        removeActive(navOptions, true);
    }
})


//board intraction
function isValid(x, y){
    return (x >= 0 && x < row && y >= 0 && y < col);
}
function set(className, x = -1, y = -1){
    if (isValid(x,y)){
        matrix[x][y].classList.add(className);
    }else{
        x = Math.floor(Math.random()*row);
        y = Math.floor(Math.random()*col);
        matrix[x][y].classList.add(className);
    }
    return {x,y};
}


let isDrawing = false;
let isDragging = false;
let DragPoint = null;

function boardInteraction(cells){
cells.forEach((cell) => {
   
    const pointerdown = (e) => {
        if(e.target.classList.contains('source')){
            DragPoint = 'source';
            isDragging = true;
        }
        else if(e.target.classList.contains('target')){
            DragPoint = 'target';
            isDragging = true;
        }
        else{
            isDrawing = true;
        }
    }
    const pointermove = (e) => {
        if(isDrawing){
            e.target.classList.add('wall');
        }else if (DragPoint && isDragging){
            // document.querySelector(`.${DragPoint}`).classList.remove(`${DragPoint}`);
            cells.forEach(cell => {
                cell.classList.remove(`${DragPoint}`);
            })
            e.target.classList.add(`${DragPoint}`);
            coordinate = e.target.id.split('-')

            if (DragPoint === 'source'){
                sourceCoordinate.x = +coordinate[0];
                sourceCoordinate.y = +coordinate[1];
            }else{
                targetCoordinate.x = +coordinate[0];
                targetCoordinate.y = +coordinate[1];
            }
        }
    }
    const pointerup = () => {
        isDragging = false;
        isDrawing = false;
        DragPoint = null;
    }

    cell.addEventListener('pointerdown', pointerdown);
    cell.addEventListener('pointermove', pointermove);
    cell.addEventListener('pointerup', pointerup);
    cell.addEventListener('click',()=>{
        cell.classList.toggle('wall');
    })
});
}

const clearPathBtn = document.getElementById('clearPath');
const clearBoardBtn = document.getElementById('clearBoard');

clearPathBtn.addEventListener('click',clearPath);
clearBoardBtn.addEventListener('click',clearBoard);

function clearPath(){
    cells.forEach(cell=>{
        cell.classList.remove('path');
        cell.classList.remove('visited');
    })
}

function clearBoard(){
    cells.forEach(cell => {
        cell.classList.remove('visited');
        cell.classList.remove('wall');
        cell.classList.remove('path');
    })
}

const clearWall = ()=>{
    cells.forEach(cell=>{
        cell.classList.remove('Wall');
    })
}
var wallToAnimate;
const generateMazeBtn = document.getElementById('generateMazeBtn');
generateMazeBtn.addEventListener('click', ()=>{
    wallToAnimate = [];
    clearBoard();
    generateMaze(0,row-1, 0, col-1, false, 'horizontal');
    animate(wallToAnimate, 'wall');
})


function generateMaze(rowStart, rowEnd, colStart, colEnd, surroundingWall, Orientation){
    if(rowStart > rowEnd || colStart > colEnd) return ;
    if(!surroundingWall){
        for(let i=0; i<col; i++){
            if(!matrix[0][i].classList.contains('source')&&!matrix[0][i].classList.contains('target')){
                wallToAnimate.push(matrix[0][i]);
            }
            if (!matrix[row-1][i].classList.contains('source') && !matrix[row-1][i].classList.contains('target')){
                wallToAnimate.push(matrix[row-1][i]);
            }
            
        }
        for(let i=0; i<row; i++){
            if(!matrix[i][0].classList.contains('source') && !matrix[i][0].classList.contains('target')){
                wallToAnimate.push(matrix[i][0]);
            }
            if(!matrix[i][col-1].classList.contains('source') && !matrix[i][col-1].classList.contains('target')){
                wallToAnimate.push(matrix[i][col-1]);
            }
            
        }
        surroundingWall = true;
    }
    if(Orientation === 'horizontal'){
        let possibleRows = [];
        for(let i=rowStart; i<=rowEnd; i+=2){
            possibleRows.push(i);
        }
        let possibleCols = [];
        for(let i=colStart-1; i<colEnd+1; i+=2){
            if(i>0 && i<col-1) possibleCols.push(i);
        }

        const currentRow = possibleRows[Math.floor(Math.random()*possibleRows.length)];
        const RandomCol = possibleCols[Math.floor(Math.random()*possibleCols.length)];

        for(let i=colStart-1; i<=colEnd+1; i++){
            const cell = matrix[currentRow][i];
            if (!cell || i===RandomCol || cell.classList.contains('source') || cell.classList.contains('target')) 
                continue;
            wallToAnimate.push(cell);
        }
        generateMaze(rowStart, currentRow-2, colStart, colEnd, surroundingWall, ((currentRow-2)-rowStart > colEnd - colStart) ? 'horizontal' : 'vertical');
        generateMaze(currentRow+2, rowEnd, colStart, colEnd, surroundingWall, (rowEnd-(currentRow+2) > colEnd - colStart) ? 'horizontal' : 'vertical');
    }else{
        let possibleCols = [];
        for (let i=colStart; i<=colEnd; i+=2){
            possibleCols.push(i);
        }
        let possibleRows = [];
        for (let i=rowStart-1; i<=rowEnd+1; i+=2){
            if(i>0 && i<row-1)
                possibleRows.push(i);
        }

        const currentCol = possibleCols[Math.floor(Math.random()*possibleCols.length)];
        const randomtRow = possibleRows[Math.floor(Math.random()*possibleRows.length)];

        for(let i=rowStart-1; i<=rowEnd+1; i++){
            if(!matrix[i]) continue;
            const cell = matrix[i][currentCol];

            if(i === randomtRow || cell.classList.contains('source') || cell.classList.contains('target'))
                continue;
            wallToAnimate.push(cell);
        }
        generateMaze(rowStart, rowEnd, colStart, currentCol-2, surroundingWall, (rowEnd - rowStart > (currentCol-2) - colStart) ? 'horizontal' : 'vertical');
        generateMaze(rowStart, rowEnd, currentCol+2, colEnd, surroundingWall,(rowEnd - rowStart > colEnd - (currentCol+2)) ? 'horizontal' : 'vertical');
    }   

}

// BFS Algorithm
let visitedCell;
let pathToAnimate;
visualizeBtn.addEventListener('click', () => {
    clearPath();
    visitedCell = [];
    pathToAnimate = [];
  
    switch(algorithm){
        case 'BFS':
            BFS();
            break;
        case "Dijsktra's":
            Dijsktra();
            break;
        case 'A*':
            Astar();
            break;  
        default:
            break;    
    }

    animate(visitedCell, 'visited');
})


function BFS(){
    const queue = [];
    const visited = new Set();
    const parent = new Map();

    queue.push(sourceCoordinate);
    // console.log(sourceCoordinate, queue);
    visited.add(`${sourceCoordinate.x}-${sourceCoordinate.y}`);
    
    while(queue.length > 0){
        const current = queue.shift();
        visitedCell.push(matrix[current.x][current.y]);
        // console.log(visitedCell);

        if(current.x === targetCoordinate.x && current.y === targetCoordinate.y){
            getPath(parent, targetCoordinate);
            return;
        }
        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x, y:current.y+1},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1}
        ];
        for (const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) &&
             !visited.has(key) && 
             !matrix[neighbour.x][neighbour.y].classList.contains('wall')){
                queue.push(neighbour);
                visited.add(key);
                parent.set(key, current);
            }
        }
    }
}

function animate(elements, className){
    console.log(elements);
    let delay = 10;
    if(className === 'path') delay *= 3.5;
    for(let i = 0; i<elements.length; i++){
        setTimeout(() => {
            elements[i].classList.remove('visited');
            elements[i].classList.add(className);
            if(i === elements.length-1 && className === 'visited'){
                
                animate(pathToAnimate, 'path');
            }
        }, delay * i);
    }
}

function getPath(parent, target){
    if(!target) return;
    pathToAnimate.push(matrix[target.x][target.y]);
    const p = parent.get(`${target.x}-${target.y}`);
    getPath(parent, p);
}



// Dijsktra's Algorithm

class PriorityQueue{
    constructor(){
        this.elements = [];
        this.length = 0;
    }
    push(data){
        this.elements.push(data);
        this.length++;
        this.upHeapify(this.length-1);
    }
    pop(){
        this.swap(0, this.length-1);
        const popped = this.elements.pop();
        this.length--;
        this.downHeapify(0);
        return popped;
    }
    upHeapify(i){
        if(i === 0) return;
        const parent = Math.floor((i-1)/2);
        if(this.elements[i].cost < this.elements[parent].cost){
            this.swap(i, parent);
            this.upHeapify(parent);
        }
    }
    downHeapify(i){
        let minNode = i;
        const leftChild = 2*i + 1;
        const rightChild = 2*i + 2;

        if(leftChild < this.length && this.elements[leftChild].cost < this.elements[minNode].cost){
            minNode = leftChild;
        }if(rightChild < this.length && this.elements[rightChild].cost < this.elements[minNode].cost){
            minNode = rightChild;
        }
        if(minNode !== i){
            this.swap(minNode, i);
            this.downHeapify(minNode);
        }
    }
    isEmpty(){
        return this.length === 0;
    }
    swap(i, j){
        [this.elements[i], this.elements[j]] = [this.elements[j], this.elements[i]];
    }
}

function Dijsktra(){
    const pq = new PriorityQueue();
    const parent = new Map();
    const distance = [];
    for(let i=0; i<row; i++){
        INF = [];
        for(let j=0; j<col; j++){
            INF.push(Infinity);
        }distance.push(INF);
    }
    distance[sourceCoordinate.x][sourceCoordinate.y] = 0;
    pq.push({coordinate: sourceCoordinate, cost: 0});
    
    while(!pq.isEmpty()){
        const {coordinate: current, cost: distanceSoFar} = pq.pop();
        visitedCell.push(matrix[current.x][current.y]);

        if(current.x === targetCoordinate.x && current.y === targetCoordinate.y){
            getPath(parent, targetCoordinate);
            return;
        }
        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x, y:current.y+1},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1}
        ];
        for (const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) &&
             !matrix[neighbour.x][neighbour.y].classList.contains('wall')){
                const edgeWeight = 1;
                const distanceToNeighbour = distanceSoFar + edgeWeight;
                if(distanceToNeighbour < distance[neighbour.x][neighbour.y]){
                    distance[neighbour.x][neighbour.y] = distanceToNeighbour;
                    pq.push({coordinate: neighbour, cost: distanceToNeighbour});
                    parent.set(key, current);
                }
                
            }
        }
    }
}

function heuristicValue(node){
    return Math.abs(node.x - targetCoordinate.x) + Math.abs(node.y - targetCoordinate.y);
}


// A* algorithm

function Astar(){
    const queue = new PriorityQueue();
    const visited = new Set(); //closed Set
    const queued = new Set(); //open Set
    const parent = new Map();
gScore = [];
    for(let i=0; i<row; i++){
        INF = [];
        for(let j=0; j<col; j++){
            INF.push(Infinity);
        }gScore.push(INF);
    }

    gScore[sourceCoordinate.x][sourceCoordinate.y] = 0;
    queue.push({coordinate: sourceCoordinate, cost: 0 + heuristicValue(sourceCoordinate)});
    queued.add(`${sourceCoordinate.x}-${sourceCoordinate.y}`);
    
    while(queue.length > 0){
        const {coordinate: current} = queue.pop();
        visitedCell.push(matrix[current.x][current.y]);

        if(current.x === targetCoordinate.x && current.y === targetCoordinate.y){
            getPath(parent, targetCoordinate);
            return;
        }

        visited.add(`${current.x}-${current.y}`);
        const neighbours = [
            {x:current.x-1, y:current.y},
            {x:current.x, y:current.y+1},
            {x:current.x+1, y:current.y},
            {x:current.x, y:current.y-1}
        ];
        for (const neighbour of neighbours){
            const key = `${neighbour.x}-${neighbour.y}`;
            if(isValid(neighbour.x, neighbour.y) &&
             !visited.has(key) && !queued.has(key) &&
             !matrix[neighbour.x][neighbour.y].classList.contains('wall')){
                const edgeWeight = 1;
                const gScoreToNeighbour = gScore[current.x][current.y] + edgeWeight;
                const fScore = gScoreToNeighbour + heuristicValue(neighbour);
                if(gScoreToNeighbour < gScore[neighbour.x][neighbour.y]){
                    gScore[neighbour.x][neighbour.y] = gScoreToNeighbour;
                    queue.push({coordinate: neighbour, cost: fScore});
                    queued.add(key);
                    parent.set(key, current);
                }
            }
        }
    }
}







