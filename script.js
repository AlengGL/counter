let isRunning = false; // 表示計時器是否正在運行

let rafId = null; // 用來儲存requestAnimationFrame的ID 用來暫停或取消
let timeoutId = null; // 用來儲存setTimeout的ID 用來暫停或取消
let startTime = null; // 儲存計時器啟動的起始時間
let elapsedMs = 0; // 儲存計時器暫停時已過的毫秒數

let isUp = true; // 預設計時器是增加

const holeElement = document.querySelector('.hole');
holeElement.style.setProperty('--current-angle', `0deg`); // css使用變數帶入 預設給0
holeElement.style.animationPlayState = 'paused'; //預設暫停

const timerDisplay = document.querySelector('.timer');
document.querySelector('.reset').addEventListener('click', function(event) {
  // 阻止事件冒泡
  event.stopPropagation();
  resetTimer();
});

// 起始觸發事件
document.querySelector('.counter').addEventListener('click', toggleClock);


document.querySelector('.arrow').addEventListener('click', function(event) {
  const arrowIcon = this.querySelector('i');
  // 阻止事件冒泡
  event.stopPropagation();

  const currentAngle = getCurrentRotation(holeElement);
  holeElement.style.setProperty('--current-angle', `${currentAngle}deg`);

  if (isUp) {
    // 如果為增加 則改為減少
    arrowIcon.style.transform = 'rotate(180deg)';
    holeElement.style.animation = 'rotateReverse 1s linear infinite paused'; // 修改動畫
  } else {
    // 如果為減少 則改為增加
    arrowIcon.style.transform = 'rotate(0deg)';
    holeElement.style.animation = 'rotate 1s linear infinite paused'; // 重置動畫
  }

  isUp = !isUp;
  // 如果計時器正在運行，則停止並立即重新開始，這樣可以使計時方向立即生效
  if (isRunning) {
    toggleClock();
    toggleClock();
  }
}); 
// // 箭頭點擊事件
// document.querySelector('.arrow').addEventListener('click', function(event) {
//   const arrowIcon = this.querySelector('i');
//   event.stopPropagation();
//   if (isCountingUp) {
//       // 如果為增加 則改為減少
//       arrowIcon.style.transform = 'rotate(180deg)';
//       holeElement.style.animation = 'rotateReverse 1s linear infinite paused'; // 修改動畫
//   } else {
//       // 如果為減少 則改為增加
//       arrowIcon.style.transform = 'rotate(360deg)'; // 使用360度而不是0度，確保它始終從右側旋轉回來
//       holeElement.style.animation = 'rotate 1s linear infinite paused'; // 重置動畫
//   }

//   isCountingUp = !isCountingUp; // 切換狀態
  

// });

// 顯示計時器的時間
function updateUI(seconds) {
  // 如果在減少模式，且秒數達到0，停止計時器
  if (!isUp && seconds <= 0) {
    toggleClock();
    seconds = 0; // 避免顯示負數
  }
  // 計時器 format 格式設定
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if(hours > 0) {
    timerDisplay.textContent = `${hours}:${minutes}:${String(secs).padStart(2, '0')}`;
  } else if (minutes > 0) {
    timerDisplay.textContent = `${minutes}:${String(secs).padStart(2, '0')}`;
  } else {
    timerDisplay.textContent = `${String(secs)}`;
  }
}

// 這邊較困難 主要是模擬setInterval 避免不精準的問題點
// 參考網站 https://zhuanlan.zhihu.com/p/452478510
function interval(ms, callback) {
  // 取得當前時間
  const current = performance.now();
  if (!startTime) {
      startTime = current;
  }

  let timeElapsed;
  if (isUp) {
      timeElapsed = current - startTime + elapsedMs;
  } else {
      timeElapsed = startTime - current + elapsedMs;
  }
  const seconds = Math.floor(timeElapsed / ms);
  callback(seconds);

  const nextIntervalStart = (seconds + (isUp ? 1 : -1)) * ms;
  const delay = nextIntervalStart - timeElapsed;

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
      elapsedMs += performance.now() - startTime;
      startTime = null;
      // 停止.hole的旋轉
      holeElement.style.animationPlayState = 'paused';
  } else {
      // Start the timer
      interval(1000, updateUI);
      // 重新開始.hole的旋轉
      holeElement.style.animationPlayState = 'running';
  }
  isRunning = !isRunning;
}

// 重設
function resetTimer() {
  cancelAnimationFrame(rafId);
  clearTimeout(timeoutId);
  // 移除動畫
  holeElement.style.animation = 'none';
  // 重新觸發動畫
  holeElement.offsetWidth;
  // 再次設定動畫，但這次為暫停狀態
  holeElement.style.setProperty('--current-angle', `0deg`);
  holeElement.style.animation = 'rotate 1s linear infinite paused';

  startTime = null;
  elapsedMs = 0;
  isRunning = false;
  updateUI(0);
}

// 獲取旋轉角度
function getCurrentRotation(el) {
  const st = window.getComputedStyle(el, null); // 元素當前CSS
  const tr = st.getPropertyValue("transform"); // 取transform
  if (tr === "none") {
    return 0;
  }

  const values = tr.split("(")[1].split(")")[0].split(","); // 從matrix表示中提取出具體值
  const a = values[0];
  const b = values[1];
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI)); // atan2返回弧度值 乘以(180 / Math.PI)來將其轉換為度
  return (angle + 360) % 360; // 確保值為正
}
