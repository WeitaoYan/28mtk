class Cell {
    constructor(row, col, element) {
        this.row = row;
        this.col = col;
        this.element = element;
        this.flag = "unknown";
    }
    getState() {
        let p = this.element.querySelector("p");
        if (p) {
            this.flag = Number(p.innerText);
        } else if (this.element.style.backgroundColor === "rgb(188, 255, 0)" || this.element.style.backgroundColor === "rgb(221, 254, 54)") {
            this.flag = 0;
        }
        return this.flag;
    }
    setFlag(content) {
        console.log(`${content} set tree row:${this.row} col:${this.col}`);
        this.flag = "tree";
    }
    click(content) {
        console.log(`${content} click row:${this.row} col:${this.col}`);
        this.element.click();
        this.getState();
    }
}

function getCells() {
    let cells = [];
    let elements = document.querySelectorAll("#__nuxt>div>div:nth-child(4)>div>div:nth-child(3)>div>div");
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        let row = Math.floor(i / 30);
        let col = i % 30;
        cells.push(new Cell(row,col,element));
    }
    return cells;
}

function getNeighbor(cell, arr2D) {
    const result = [];
    const row = cell.row;
    const col = cell.col;
    const directions = [[-1, -1], // top-left
    [-1, 0], // top
    [-1, +1], // top-right
    [0, -1], // left
    [0, +1], // right
    [+1, -1], // bottom-left
    [+1, 0], // bottom
    [+1, +1], // bottom-right
    ];
    for (const [dr,dc] of directions) {
        const neighbor = getCellByLocation(row + dr, col + dc, arr2D);
        if (neighbor) {
            result.push(neighbor);
        }
    }
    return result;
}

function getCellByLocation(row, col, arr2D) {
    if (-1 < row && row < 16 && -1 < col && col < 30) {
        return arr2D[row][col];
    }
}

function convertTo2D(arr, rows, colsPerRow) {
    const result = [];
    for (let i = 0; i < rows; i++) {
        const start = i * colsPerRow;
        const end = start + colsPerRow;
        result.push(arr.slice(start, end));
    }
    return result;
}

function countFlagged(cells) {
    let count = 0;
    for (let cell of cells) {
        if (cell.flag === "tree") {
            count++;
        }
    }
    return count;
}
// 这里一定是安全区
function handleNumberCell(node, cell, cell2D) {
    cell.flag = Number(node.innerText)
    let neighbors = getNeighbor(cell, cell2D);
    let unknownNcell = neighbors.filter( (ncell) => ncell.getState() === "unknown");
    let unknownCount = unknownNcell.length;
    if (unknownCount == cell.flag) {
        unknownNcell.forEach( (cell) => cell.setFlag(`click because ${cell} only has ${cell.flag} unknown Ncell`))
    }
}
    
//这里一定是树的cell
function handleImageCell(node, cell, cell2D) {
    cell.getState();
    // 找出所有树的相邻格子中有数字的
    let neighbors = getNeighbor(cell, cell2D);
    let knownNcell = neighbors.filter( (ncell) => typeof ncell.getState() === "number");
    //如果数字和周边已知树一样，则表示剩余格子都是安全可以点的
    knownNcell.forEach(numberCell => {
        let ncells = getNeighbor(numberCell, cell2D);
        let treeCount = ncells.filter(c => c.getState() === "tree").length;
        if (treeCount == numberCell.flag){
            let unknownCells = ncells.filter(c => c.getState() == "unknown");
            unknownCells.forEach(c => c.click());
        }
    });
}
let cells = getCells();
let cell2D = convertTo2D(cells, 16, 30);
let config = {
    childList: true,
    attributes: true
};
cells.forEach( (cell) => {
    let targetCell = cell.element;
    const observer = new MutationObserver( (mutations) => {
        mutations.forEach( (mutation) => {
            let box = mutation.target;
            let cell = cells.find( (e) => e.element === box);
            mutation.addedNodes.forEach( (node) => {
                if (node.nodeName === 'P') {
                    handleNumberCell(node, cell, cell2D);
                }
                if (node.nodeName === "IMG"){
                     handleImageCell(node, cell, cell2D)
                }
            }
            )
            cell.getState();
        }
        );
    }
    );
    observer.observe(targetCell, config);
}
)
