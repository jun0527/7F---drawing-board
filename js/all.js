const headerMenu = document.querySelector('.js-headerMenu');
const headerBtn = document.querySelectorAll('.js-headerMenu a');
const footerMenu = document.querySelector('.js-footerMenu');
const expandBtn = document.querySelectorAll('.js-expandBtn');
const expandIcon = document.querySelectorAll('.js-expandBtn span');
const modelItem = document.querySelectorAll('.js-modelList li');
const colorBtn = document.querySelectorAll('.js-colorBtnList li');
const sizeInput = document.querySelector('.js-sizeInput');
const canvas = document.querySelector('.js-drawingBoard');
let headerOpen = true;
let footerOpen = true;
let toolModel = 'brush';
let modelIcon = `<span class="material-icons" data-model="brush">
brush
</span>`;
let toolColor = '#000';
let startPointX;
let startPointY;
let movePointX;
let movePointY;
let lineSize = 10;
let squareBeforeImg;
let undoList = [];
let currentImg;
let redoList = [];
let saveData = '';
//切換摺疊選單
expandBtn.forEach((item, index) => {
  //設定按按鈕時不能畫畫
  item.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  })
  item.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  })
  item.addEventListener('click', (e) => {
    if (index === 0) {
      headerOpen = !headerOpen;
      switch (headerOpen) {
        case true:
          headerMenu.setAttribute('class', 'js-headerMenu d-flex jc-center');
          expandIcon[index].textContent = 'expand_less';
          break;
        case false:
          headerMenu.setAttribute('class', 'js-headerMenu d-none');
          expandIcon[index].textContent = 'expand_more';
          break;
      }
    }
    if (index === 1) {
      footerOpen = !footerOpen;
      switch (footerOpen) {
        case true:
          footerMenu.setAttribute('class', 'js-footerMenu footerMenu d-flex ai-center');
          item.setAttribute('class', 'js-expandBtn expandBtn');
          item.innerHTML = `<span class="material-icons">
          expand_more
        </span>`;
          break;
        case false:
          footerMenu.setAttribute('class', 'js-footerMenu footerMenu d-none');
          item.setAttribute('class', 'js-expandBtn expandBtn expandLessBtn');
          item.innerHTML = modelIcon;
          break;
      }
    }
  })
})
//切換畫筆
modelItem.forEach((item, index) => {
  //切換畫筆時不能畫畫
  item.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  })
  item.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  })
  item.addEventListener('click', (e) => {
    modelItem.forEach((item) => {
      item.setAttribute('class', 'modelListBtn');
    })
    modelItem[index].setAttribute('class', 'modelListBtn active');
    toolModel = e.target.getAttribute('data-model');
    switch (toolModel) {
      case 'brush':
        modelIcon = `<span class="material-icons" data-model="brush">
        brush
        </span>`;
        break;
      case 'hollowSquare':
        modelIcon = `<span class="material-icons-outlined" data-model="hollowSquare">
        stop
        </span>`;
        break;
      case 'solidSquare':
        modelIcon = `<span class="material-icons" data-model="solidSquare">
        stop
        </span>`;
        break;
      case 'erase':
        modelIcon = `<span class="material-icons" data-model="solidSquare">
        smartphone
        </span>`;
        break;
    }
  })
})
//切換顏色
colorBtn.forEach((item, index) => {
  //切換顏色時不能畫畫
  item.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  })
  item.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  })
  item.addEventListener('click', (e) => {
    colorBtn.forEach((item) => {
      item.setAttribute('class', '');
    })
    colorBtn[index].setAttribute('class', 'active');
    toolColor = e.target.getAttribute('data-color');
  })
})
//切換SIZE
//切換SIZE時不能畫畫
sizeInput.addEventListener('mousedown', (e) => {
  e.stopPropagation();
})
sizeInput.addEventListener('mouseup', (e) => {
  e.stopPropagation();
})
sizeInput.addEventListener('change', (e) => {
  lineSize = sizeInput.value;
})
//畫板
//設定畫板尺寸
window.addEventListener('resize', canvasSize);
function canvasSize() {
  canvas.width = document.body.clientWidth - window.scrollX;
  canvas.height = document.body.clientHeight - window.scrollX;
}
canvasSize()
//繪畫設定
if (canvas.getContext) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
  headerBtnEvent(ctx);
  mouseEvent(ctx);
}
//設定初始點座標
function drawPoint(ctx) {
  ctx.beginPath();
  ctx.moveTo(startPointX, startPointY);
  ctx.fillStyle = toolColor;
  ctx.lineTo(startPointX, startPointY);
  switch(toolModel) {
    case 'hollowSquare':
    case 'solidSquare':
      squareBeforeImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
      break;
  }
}
//畫筆及橡皮差工具
function brushTool(ctx) {
  switch (toolModel) {
    case 'brush':
      ctx.strokeStyle = toolColor;
      break;
    case 'erase':
      ctx.strokeStyle = '#E8E8E8';
      break;
  }
  ctx.lineWidth = lineSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(startPointX, startPointY);
  ctx.lineTo(movePointX, movePointY);
  ctx.stroke();
}
//矩形工具
function squareTool(ctx) {
  ctx.putImageData(squareBeforeImg, 0, 0);
  ctx.strokeStyle = toolColor;
  ctx.fillStyle = toolColor;
  ctx.lineWidth = lineSize;
  let width = movePointX - startPointX;
  let height = movePointY - startPointY;
  ctx.strokeRect(startPointX, startPointY, width, height);
  switch (toolModel) {
    case 'solidSquare': {
      ctx.fillRect(startPointX, startPointY, width, height);
      break;
    }
  }
}
//滑鼠監聽
function mouseEvent(ctx) {
  window.addEventListener('mousedown', mouseDownHandler);
  //按下滑鼠的事件
  function mouseDownHandler(e) {
    startPointX = e.clientX;
    startPointY = e.clientY;
    drawPoint(ctx);
    window.addEventListener('mousemove', mouseMoveHandler);
  }
  //滑鼠移動事件
  function mouseMoveHandler(e) {
    movePointX = e.clientX;
    movePointY = e.clientY;
    switch(toolModel) {
      case 'brush':
      case 'erase':
        brushTool(ctx);
        startPointX = e.clientX;
        startPointY = e.clientY;
        break;
      case 'hollowSquare':
      case 'solidSquare':
        squareTool(ctx);
        break;
    } 
    window.addEventListener('mouseup', mouseUpHandler);
  }
  //滑鼠放開事件
  function mouseUpHandler(e) {
    undoList.push(currentImg);
    currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    headerBtn[2].setAttribute('class', 'd-flex ai-center');
    redoList = [];
    headerBtn[3].setAttribute('class', 'd-flex ai-center disabled');
    ctx.stroke();
    window.removeEventListener('mousemove', mouseMoveHandler);
  }
}
//header功能列按鈕監聽
function headerBtnEvent(ctx) {
  //按功能鍵時不能畫畫
  headerMenu.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  })
  headerMenu.addEventListener('mouseup', (e) => {
    e.stopPropagation();
  })
  headerMenu.addEventListener('click', (e) => {
    switch (e.target.getAttribute('data-function')) {
      case null:
        break;
      case 'save':
        saveData = canvas.toDataURL();
        e.target.download = 'drawingBoard.png';
        e.target.href = saveData;
        clear(ctx);
        break;
      case 'clearAll':
        clear(ctx);
        break;
      case 'undo':
        switch (undoList.length) {
          case 0:
            headerBtn[2].setAttribute('class', 'd-flex ai-center disabled');
            break;
          default:
            ctx.putImageData(undoList[undoList.length - 1], 0, 0);
            redoList.push(currentImg);
            currentImg = undoList.pop();
            break;
        }
        if (undoList.length === 0) {
          headerBtn[2].setAttribute('class', 'd-flex ai-center disabled');
        }
        if (redoList.length !== 0) {
          headerBtn[3].setAttribute('class', 'd-flex ai-center');
        }
        break;
      case 'redo':
        switch (redoList.length) {
          case 0:
            headerBtn[3].setAttribute('class', 'd-flex ai-center disabled');
            break;
          default:
            ctx.putImageData(redoList[redoList.length - 1], 0, 0);
            undoList.push(currentImg);
            currentImg = redoList.pop();
            break;
        }
        if (redoList.length === 0) {
          headerBtn[3].setAttribute('class', 'd-flex ai-center disabled');
        }
        if (undoList.length !== 0) {
          headerBtn[2].setAttribute('class', 'd-flex ai-center');
        }
        break;
    }
  })
}
//全部清除功能
function clear(ctx) {
  undoList = [];
  currentImg;
  redoList = [];
  headerBtn[2].setAttribute('class', 'd-flex ai-center disabled');
  headerBtn[3].setAttribute('class', 'd-flex ai-center disabled');
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
}