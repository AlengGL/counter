let isRunning = false; // 表示計時器是否正在運行
let rafId = null; // 用來儲存requestAnimationFrame的ID 用來暫停或取消
let timeoutId = null; // 用來儲存setTimeout的ID 用來暫停或取消
let startTime = null; // 儲存計時器啟動的起始時間
let elapsedMs = 0; // 儲存計時器暫停時已過的毫秒數
let isUp = true; // 預設計時器是增加

let currentAngle = 0;

const holeElement = document.querySelector('.hole');
holeElement.style.transform = `rotate(0deg)`;

const timerElement = document.querySelector('.timer');
const arrowIcon = document.querySelector('.arrow i');

document.querySelector('.reset').addEventListener('click', event => {
  event.stopPropagation();
  resetTimer();
});

// 起始觸發事件
document.querySelector('.counter').addEventListener('click', toggleClock);

document.querySelector('.arrow').addEventListener('click', event => {
  // 阻止事件冒泡
  event.stopPropagation();
  if (timeoutId === 0) return;
  // 更換arrow方想
  arrowChange();
  // 如果計時器正在運行，則停止並立即重新開始，這樣可以使計時方向立即生效
  if (isRunning) {
    toggleClock();
    toggleClock();
  }
});

function updateHoleRotation() {
  if (!isRunning) return;
  const current = performance.now();
  const timeElapsed = isUp ? (current - startTime + elapsedMs) : (elapsedMs - (current - startTime));
  // 這裡直接將timeElapsed轉換為角度
  currentAngle = (timeElapsed % 1000) * 0.36; // 0.36 = 360/1000
  
  holeElement.style.transform = `rotate(${currentAngle}deg)`;

  if (isRunning) {
    requestAnimationFrame(updateHoleRotation);
  }
}

// arrow更換與加減更換
function arrowChange() {
  const currentSeconds = parseInt(timerElement.textContent, 10);
  // 更新時間
  if (isRunning) {
    const current = performance.now();
    elapsedMs = isUp ? (current - startTime + elapsedMs) : (elapsedMs - (current - startTime));
    startTime = current; // 重設起始時間
  } else if (elapsedMs <= 0){
    return;
  }

  isUp ? arrowIcon.style.transform = 'rotate(180deg)'
       :  arrowIcon.style.transform = 'rotate(0deg)';
  isUp = !isUp;

  if (!isRunning && !(elapsedMs <= 0)) {
    updateUI(currentSeconds);
    toggleClock();
  }
}

// 更新與format計時器的時間
function updateUI(seconds) {
  // 計時器 format 格式設定
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if(hours > 0) {
    timerElement.textContent = `${hours}:${minutes}:${String(secs).padStart(2, '0')}`;
  } else if (minutes > 0) {
    timerElement.textContent = `${minutes}:${String(secs).padStart(2, '0')}`;
  } else {
    timerElement.textContent = `${String(secs)}`;
  }
}

// 這邊較困難 主要是模擬setInterval 避免不精準的問題點
// 參考網站 https://zhuanlan.zhihu.com/p/452478510
function interval(ms, callback) {
  // 取得當前時間
  const current = performance.now();
  if (!startTime) startTime = current;

  const timeElapsed = isUp ? (current - startTime + elapsedMs) : (elapsedMs - (current - startTime));
  const seconds = Math.floor(timeElapsed / ms);
  callback(seconds);

  const delay = ((seconds + (isUp ? 1 : -1)) * ms) - timeElapsed;
  // 查看是否到0
  if (!isUp && timeElapsed <= 0) {
    arrowChange();
    resetTimer();
    return;
  }
  timeoutId = setTimeout(() => {
    rafId = requestAnimationFrame(() => interval(ms, callback));
  }, delay);
}

// 切換運行和暫停
function toggleClock() {
  if (isRunning) {
    // Pause the timer
    cancelAnimationFrame(rafId);
    clearTimeout(timeoutId);
    const current = performance.now();
    elapsedMs = isUp ? (current - startTime + elapsedMs) : (elapsedMs - (current - startTime));
    startTime = null;
  } else {
    // Start the timer
    interval(1000, updateUI);
    rafId = requestAnimationFrame(updateHoleRotation);
  }
  isRunning = !isRunning;
}

// 重設
function resetTimer() {
  cancelAnimationFrame(rafId);
  clearTimeout(timeoutId);
  currentAngle = 0;
  holeElement.style.transform = `rotate(0deg)`;
  arrowIcon.style.transform = 'rotate(0deg)';
  timerElement.textContent = '0'; // 將計時器顯示重設為0
  elapsedMs = 0; // 重設已過時間
  startTime = null;
  isRunning = false;
  isUp = true; // 重設計時方向為正向
  totalRotation = 0;
  updateUI(0);
}

