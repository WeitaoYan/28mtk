class Cell {
    constructor(row, col, element) {
        this.row = row;
        this.col = col;
        this.element = element;
    }
    getState() {
        let img = this.element.querySelector("img");
        if (img) {
            return "tree";
        }
        let p = this.element.querySelector("p");
        if (p) {
            return Number(p.innerText);
        } else if (this.element.style.backgroundColor === "rgb(188, 255, 0)" || this.element.style.backgroundColor === "rgb(221, 254, 54)") {
            return 0;
        }
        return "unknown";
    }
    click(content) {
        console.log(`${content} click row:${this.row} col:${this.col}`);
        this.element.click();
        this.getState();
    }
}

function getCells() {
    let cells = [];
    let elements = document.querySelectorAll("#__nuxt>div>div:nth-child(4)>div>div:nth-child(3)>div>div.relative");
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

function convertTo2D(arr) {
    let rows = 16;
    let colsPerRow = 30;
    const result = [];
    for (let i = 0; i < rows; i++) {
        const start = i * colsPerRow;
        const end = start + colsPerRow;
        result.push(arr.slice(start, end));
    }
    return result;
}

function countUnknown(cells) {
    return cells.filter(cell => cell.getState() === "unknown").length;
}

// 这里一定是安全区
function handleNumberCell(node, cell, cell2D) {
    let num = Number(node.innerText)
    let neighbors = getNeighbor(cell, cell2D);
    let unknownNcell = neighbors.filter( (ncell) => ncell.getState() === "unknown");
    let unknownCount = unknownNcell.length;
    if (num != 0 && unknownCount == num) {
        unknownNcell.forEach( (cell) => markTree(cell))
    }
}

//这里一定是树的cell
function handleImageCell(node, cell, cell2D) {
    clearCellTree(cell);
    // 找出所有树的相邻格子中有数字的
    let neighbors = getNeighbor(cell, cell2D);
    let knownNcell = neighbors.filter( (ncell) => typeof ncell.getState() === "number");
    //如果数字和周边已知树一样，则表示剩余格子都是安全可以点的
    knownNcell.forEach(numberCell => {
        let ncells = getNeighbor(numberCell, cell2D);
        let treeCount = ncells.filter(c => c.getState() === "tree").length;
        let unknownCells = ncells.filter(c => c.getState() == "unknown");
        let unknownCount = unknownCells.length;
        if (treeCount == numberCell.getState()) {
            unknownCells.forEach(c => c.click());
        } else if (treeCount + unknownCount == numberCell.getState()) {
            unknownCells.forEach(c => markTree(c));
        }
    }
    );
}

function start() {
    let cells = getCells();
    clearTree(cells);
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
                    if (node.nodeName === "IMG") {
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
    setInterval( () => {
        let knownNcell = cells.filter( (cell) => typeof cell.getState() === "number");
        knownNcell.forEach( (numCell) => {
            let num = numCell.getState();
            if (num === 0) {
                return
            }
            let neighbors = getNeighbor(numCell, cell2D);
            let unknownNcell = neighbors.filter( (ncell) => ncell.getState() === "unknown");
            let unknownCount = unknownNcell.length;
            if (num != 0 && unknownCount == num) {
                unknownNcell.forEach( (cell) => markTree(cell))
            }
        }
        )
        //如果数字和周边已知树一样，则表示剩余格子都是安全可以点的
        knownNcell.forEach(numberCell => {
            let ncells = getNeighbor(numberCell, cell2D);
            let treeCount = ncells.filter(c => c.getState() === "tree").length;
            if (treeCount == numberCell.getState()) {
                let unknownCells = ncells.filter(c => c.getState() == "unknown");
                unknownCells.forEach(c => c.click());
            }
        }
        )
    }
    , 1000)
}

function simulateRightClick(element) {
    // 获取元素位置（如果未提供坐标）
    const rect = element.getBoundingClientRect();
    const x = rect.left + Math.random() * rect.width;
    const y = rect.top + Math.random() * rect.height;
    // 创建事件对象
    const eventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
        button: 2,
        // 右键
        buttons: 2 // 右键
    };
    // 触发完整的事件序列
    element.dispatchEvent(new MouseEvent('mousedown',eventInit));
    element.dispatchEvent(new MouseEvent('mouseup',eventInit));
    element.dispatchEvent(new MouseEvent('contextmenu',eventInit));
}

function markTree(cell) {
    // TODO
    //simulateRightClick(cell.element);
    return
    // let tree = cell.element.querySelector("span");
    // if (tree) {
    //     return
    // }
    // var span = document.createElement('span');
    // span.innerHTML = '🌲';
    // cell.element.appendChild(span);

}

function clearTree(cells) {
    cells.forEach(cell => {
        let spans = cell.element.querySelectorAll("span");
        for (let span of spans) {
            span.remove();
        }
    }
    )
}

function clearCellTree(cell) {
    let span = cell.element.querySelector("span");
    if (span) {
        span.remove();
    }
}

function searchAndMarkTree() {
    let cells = getCells();
    let cell2D = convertTo2D(cells)
    let numCells = cells.filter( (cell) => typeof cell.getState() === "number");
    let ensureCells = numCells.filter(cell => {
        let neighbors = getNeighbor(cell, cell2D);
        let unknownCells = neighbors.filter(cell => cell.getState() === "unknown");
        let treeCells = neighbors.filter(cell => cell.getState() === "tree");
        let num = cell.getState();
        if (num != 0) {
            return unknownCells.length + treeCells.length == num;
        }
    }
    );
    ensureCells.forEach( (ensureCell) => {
        let neighbors = getNeighbor(ensureCell, cell2D);
        let unknownCells = neighbors.filter(cell => cell.getState() === "unknown");
        unknownCells.forEach(cell => simulateRightClick(cell.element));
    }
    );
}
function addButton(){
    // 创建按钮元素
    var button = document.createElement('button');
    button.textContent = '搜索并标记树';
    button.style.position = 'fixed';
    button.style.right = '200px';
    button.style.bottom = '200px';
    button.id = 'searchAndMarkBtn';
    button.style.padding = '8px 16px';
    button.style.margin = '10px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.onmouseover = function() { this.style.opacity = '0.8'; };
    button.onmouseout = function() { this.style.opacity = '1'; };

    // 添加点击事件监听器
    button.addEventListener('click', function() {
        if (typeof searchAndMarkTree === 'function') {
            searchAndMarkTree();
        } else {
            console.error('searchAndMarkTree 函数未定义');
        }
    });
    
    // 将按钮添加到页面中（这里添加到 body 的末尾）
    document.body.appendChild(button);
}
/// "#__nuxt>div>div:nth-child(4)>div>div:nth-child(3)>div>div.absolute>div>div"
start();
addButton();