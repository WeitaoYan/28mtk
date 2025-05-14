class Cell {
  constructor(row, col, element) {
    this.row = row;
    this.col = col;
    this.element = element;
    const span = document.createElement("span");
    span.innerText = `${row},${col}`;
    this.element.appendChild(span);
    this.flag = "unknown";
  }
  getState() {
    let p = this.element.querySelector("p");
    if (p) {
      this.flag = Number(p.innerText);
    } else if (
      this.element.style.backgroundColor === "rgb(188, 255, 0)" ||
      this.element.style.backgroundColor === "rgb(221, 254, 54)"
    ) {
      this.flag = 0;
    }
    return this.flag;
  }
  setFlag(content) {
    console.log(content);
    console.log(`set tree row:${this.row} col:${this.col}`);
    // 创建一个新的 <p> 元素
    const newP = document.createElement("span");
    // 设置新 <p> 元素的内容
    newP.innerText = "🚩";
    //插入到this.element中
    this.element.appendChild(newP);
    this.flag = "tree";
  }
  click(content) {
    console.log(content);
    console.log(`click row:${this.row} col:${this.col}`);
    this.element.click();
    this.getState();
  }
}
function getCells() {
  let cells = [];
  let elements = document.querySelectorAll(
    "#__nuxt>div>div:nth-child(4)>div>div:nth-child(3)>div>div"
  );
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    let row = Math.floor(i / 30);
    let col = i % 30;
    cells.push(new Cell(row, col, element));
  }
  return cells;
}
function getNeighbor(cell, arr2D) {
  const result = [];
  const row = cell.row;
  const col = cell.col;
  const directions = [
    [-1, -1], // top-left
    [-1, 0], // top
    [-1, +1], // top-right
    [0, -1], // left
    [0, +1], // right
    [+1, -1], // bottom-left
    [+1, 0], // bottom
    [+1, +1], // bottom-right
  ];
  for (const [dr, dc] of directions) {
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
function startGame(cells, cells2D) {
  for (let cell of cells) {
    // console.log(`check ${cell.row},${cell.col}`);
    let state = cell.getState();
    if (typeof state === "number") {
      if (state === 0) {
        continue;
      }
      let neighbors = getNeighbor(cell, cells2D);

      let treeNeighborCount = neighbors.filter((neighbor) => {
        return neighbor.flag === "tree";
      }).length;
      if (treeNeighborCount === state) {
        for (let neighbor of neighbors) {
          if (neighbor.flag === "unknown") {
            neighbor.click(`check ${cell.row},${cell.col}`);
          }
        }
      }

      setTimeout(() => {
        let unknownNeighborCount = neighbors.filter((neighbor) => {
          return neighbor.flag === "unknown";
        }).length;
        if (unknownNeighborCount === state) {
          for (let neighbor of neighbors) {
            if (neighbor.flag === "unknown") {
              neighbor.setFlag(`check ${cell.row},${cell.col}`);
            }
          }
        }
      }, 100);
    }
  }
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
function main() {
  let cells = getCells();
  let cells2D = convertTo2D(cells, 16, 30);
  let center = cells2D[7][15];
  center.click();
  setInterval(function () {
    play(cells, cells2D);
  }, 100);
}
function play(cells, cells2D) {
  let flagged = countFlagged(cells);
  if (flagged === 75) {
    for (let cell of cells) {
      if (cell.flag === "unknown") {
        cell.click();
      }
    }
  }
  startGame(cells, cells2D);
}
