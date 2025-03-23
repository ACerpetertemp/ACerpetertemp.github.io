const gameState = {
    boardSize: 11,
    currentPlayer: 'red',  
    board: [],             
    moveCount: 0,
    fileInitGame:0,         
    adjust:0,
    exporttext:'',
    swapped: false,
    modee:1,
    moveb:-1,
    usedPairs :new Set(),
    timeId: null
};
const body = document.body;
const boardElement = document.getElementById('hex-board');
const newGameButton = document.getElementById('new-game');
const boardSizeSelector = document.getElementById('board-size');
const zoom= document.getElementById('zoomInput');
const gameStatusElement = document.getElementById('game-status');
const qiziColor= document.getElementById('qizi-color');
const Mode= document.getElementById('mode');
const ex= document.getElementById('export');
function qiziColorChange(p)
{
    if(p==6)
        {
            document.documentElement.style.setProperty('--red-color', 'red');
            document.documentElement.style.setProperty('--blue-color', 'blue');
        }
    if(p==7)
    {
        document.documentElement.style.setProperty('--red-color', 'blue');
        document.documentElement.style.setProperty('--blue-color', 'red');
    }
    else if(p==8)
    {
        document.documentElement.style.setProperty('--red-color', 'black');
        document.documentElement.style.setProperty('--blue-color', 'white');
    }
    else if(p==9)
    {
        document.documentElement.style.setProperty('--red-color', 'white');
        document.documentElement.style.setProperty('--blue-color', 'black');
    }
}
function zoomChange(paddingValue)
{   if(paddingValue<0)
    {
        paddingValue=100;
        alert("请输入大于等于0的数字,已经置为默认值100");
    }
    gameState.adjust=paddingValue;
    body.style.padding = `${paddingValue}px`;
}
function initGame(size) {
    gameState.usedPairs.clear();
    gameState.fileInitGame=1;
    gameState.moveb=-1;
    gameState.swapped = false;
    recordClear();
    qiziColorChange(parseInt(qiziColor.value));
    gameState.boardSize = size;
    gameState.currentPlayer = 'red';
    gameState.moveCount = 0;
    gameState.board = Array(size).fill().map(() => Array(size).fill(null));
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, 40px)`;
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'hex-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.marginLeft = `${row * 20-(size-1)*20/2}px`;
            cell.addEventListener('click', () => handleCellClick(row, col,0));//0表示人，1表示电脑
            boardElement.appendChild(cell);
        }
    }
    
    updateGameStatus();
}


function handleCellClick(row, col,p) {
    if ((gameState.board[row][col] !== null && gameState.moveCount !== 1)) {
        return;
    }
    if((p===0 && gameState.modee===2 ) && gameState.currentPlayer==='red')
    {
        return;
    }
    let inputPair = JSON.stringify([col, row]);
    gameState.usedPairs.add(inputPair);
    gameState.moveCount++;//这个不能往后放，很关键
    recordMove(row, col, gameState.currentPlayer);
    if((gameState.board[row][col] !== null && gameState.moveCount === 2))
    {
        swapPlayers();
        return;
    }
    gameState.board[row][col] = gameState.currentPlayer;
    const cell = document.querySelector(`.hex-cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add(gameState.currentPlayer);
    gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
    updateGameStatus();
}
function withDraw(num) {
    while (gameState.moveCount > num) {
        // alert(`正在处理第${gameState.moveCount}步`);
        let element = document.querySelector(`.step${gameState.moveCount}`);
        const cells = document.querySelector(`.hex-cell[data-row="${element.dataset.row}"][data-col="${element.dataset.col}"]`);
        cells.classList.remove('blue');
        cells.classList.remove('red');
        gameState.board[element.dataset.row][element.dataset.col] = null;
        gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'blue' : 'red';
        if(gameState.moveCount==2 && gameState.swapped === true)
        {   
            gameState.swapped = false;
            const cella = document.querySelector(`.hex-cell[data-row="${element.dataset.row}"][data-col="${element.dataset.col}"]`);
            cella.classList.remove('blue');
            cella.classList.remove('red');
            cella.classList.add(gameState.currentPlayer === 'red' ? 'blue' : 'red');
            const cellb = document.querySelector(`.hex-cell[data-row="${element.dataset.col}"][data-col="${element.dataset.row}"]`);
            cellb.classList.remove('blue');
            cellb.classList.remove('red');
            gameState.board[element.dataset.row][element.dataset.col] = gameState.currentPlayer === 'red' ? 'blue' : 'red';
            gameState.board[element.dataset.col][element.dataset.row] = null;
        }
        if (element) {
            element.remove();
        }
        gameState.moveCount--;
    }
    updateGameStatus();
}
function swapPlayers() {
    if (gameState.moveCount !== 2) {
        return;
    }
    gameState.swapped = true;
    for (let row = 0; row < gameState.boardSize; row++) {
        for (let col = 0; col < gameState.boardSize; col++) {
            if (gameState.board[row][col] === 'red') {
                gameState.board[row][col] = null;
                gameState.board[col][row] = 'blue';
                const cell = document.querySelector(`.hex-cell[data-row="${row}"][data-col="${col}"]`);
                cell.classList.remove('red');
                const cell2 = document.querySelector(`.hex-cell[data-row="${col}"][data-col="${row}"]`);
                cell2.classList.add('blue');
                gameState.currentPlayer = 'red';
                updateGameStatus();
                break;
            }
        }
    }
}

function updateGameStatus() {
        gameStatusElement.textContent = `${gameState.currentPlayer === 'red' ? 'A方' : 'B方'}回合`;
}
function downloadTextFile(text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qipu.txt';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
function recordMove(row, col, color) {
    const historyContent = document.getElementById('history-content');
    historyContent.className=`history`;
    const moveRecord = document.createElement('div');
    moveRecord.textContent = `step${gameState.moveCount}:${color === 'red' ? 'A' : 'B'}方: (${row}, ${col})`;
    moveRecord.className = "step"+gameState.moveCount;
    moveRecord.dataset.h=gameState.moveCount
    moveRecord.dataset.row = row;
    moveRecord.dataset.col = col;
    moveRecord.addEventListener('click', () => {
        if(gameState.modee==2)
        {
            alert("人机对战模式下不可以撤回");
            return;
        }
        alert(`退回${moveRecord.className}`);
        withDraw(parseInt(moveRecord.dataset.h));
    });
    historyContent.prepend(moveRecord);
}

function recordClear() {
    const historyContent = document.getElementById('history-content');
    historyContent.innerHTML = '';
}

  function main() {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function generateRandomPair() {
        let pair;
        do {
            const a = getRandomInt(gameState.boardSize); 
            const b = getRandomInt(gameState.boardSize); 
            pair = JSON.stringify([a, b]);
        } while (gameState.usedPairs.has(pair)); 

        gameState.usedPairs.add(pair); 
        return JSON.parse(pair); 
    }
    // function clearUsedPairs() {
    //     usedPairs.clear();
    // }

    return generateRandomPair;
}
g=main();
function checkCondition() {
    if(gameState.modee==2){
      if((gameState.moveCount<gameState.boardSize*gameState.boardSize-1)){
        if(gameState.moveb<gameState.moveCount)
            {   
                if(gameState.moveCount==0)
            {   
                [x,y]=g();
                console.log(x,y);
                handleCellClick(x,y,1);
                gameState.moveb+=2;
            }
            else{
                p=document.getElementsByClassName("step"+gameState.moveCount)[0].dataset.row;
                q=document.getElementsByClassName("step"+gameState.moveCount)[0].dataset.col;
                p=parseInt(p);
                q=parseInt(q);
                let inputPair = JSON.stringify([p, q]);
                gameState.usedPairs.add(inputPair);
                if(gameState.usedPairs.size==1)
                {gameState.usedPairs.delete([p,q]);
                gameState.usedPairs.add([q,p]);

                }
                [x,y]=g();
                console.log(x,y);
                handleCellClick(x,y,1);
                gameState.moveb+=2;
                // console.log("hi");
            }
    }
}
else { clearInterval(gameState.timeId);
    alert("即将开始新游戏");
    ModeChange(gameState.modee);
    return;
}}
}

function ModeChange(value) {
    if(value==1){
        // alert("success");
        gameState.modee=1;
        initGame(gameState.boardSize);
    }else{gameState.modee=2;
        initGame(gameState.boardSize);
        gameState.timeId=setInterval(checkCondition, 1000);
    }
}
boardSizeSelector.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') { 
      this.value = parseInt(this.value); 
    //   alert(this.value);
      if (isNaN(this.value) || this.value < 2) { 
        this.value = 11; 
        alert('您输入的不在有效范围内(2~20),已置为默认尺寸11');
      } else if (this.value > 20) {
        this.value = 11;
        alert('您输入的不在有效范围内(2~20),已调整为默认尺寸11');
      }
      gameState.boardSize = parseInt(this.value);
      initGame(parseInt(boardSizeSelector.value));
      ModeChange(gameState.modee);
    }
});
newGameButton.addEventListener('click', () => ModeChange(gameState.modee));
qiziColor.addEventListener('change', () => qiziColorChange(parseInt(qiziColor.value)));
zoom.addEventListener('change', () => zoomChange(parseInt(zoom.value)));
Mode.addEventListener('change', () => ModeChange(parseInt(Mode.value)));
initGame(parseInt(11));
ex.addEventListener('click', () => {
    gameState.exporttext=gameState.boardSize+' '+gameState.boardSize;
    for(let i = 1; i <= gameState.moveCount; i++) {
        const k=document.getElementsByClassName('step'+i)[0];
        gameState.exporttext+=('\n'+k.dataset.row+' '+k.dataset.col);
    }
    downloadTextFile(gameState.exporttext);
    return;
});
const qiPu = document.getElementById("qipu");
function removeUploadedFile() {
    qiPu.value = "";
  }
function upfile(){
    console.log("uploading");
    if(gameState.modee==2){
        removeUploadedFile();
        alert('人机模式下不可以上传棋谱');
        return;
    }
    console.log("begin ");
  const file = this.files[0]; 
  if(!file){
    console.log("nothing in file");
    return;
  }
  if (file) {
    console.log("handling file");
    gameState.fileInitGame=0;
    const reader = new FileReader();
    
    reader.onload = function(e) {
    const contents = e.target.result;
    const lines = contents.split('\n');
    lines.forEach(line => {
    const numbers = line.split(' ');
    const num1 = parseInt(numbers[0], 10); 
    const num2 = parseInt(numbers[1], 10); 
    if(gameState.fileInitGame==0)
    {
        initGame(num1);

    }
    else{
        handleCellClick(num1,num2,1);
    }

    });
    };
    
    reader.readAsText(file); 
  }
  removeUploadedFile();
  return;
}
qiPu.addEventListener("change", upfile, false);
