// Web Worker 用于后台精准计时
// 解决浏览器标签页休眠导致 setInterval 变慢的问题

let timerId: ReturnType<typeof setInterval> | null = null;
let startTime: number = 0;
let expectedTime: number = 0;

self.onmessage = (e: MessageEvent) => {
  const { type, duration } = e.data;

  switch (type) {
    case 'START':
      if (timerId) clearInterval(timerId);
      startTime = Date.now();
      expectedTime = duration * 1000;

      timerId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, expectedTime - elapsed);
        const secondsLeft = Math.ceil(remaining / 1000);

        self.postMessage({
          type: 'TICK',
          timeLeft: secondsLeft,
          elapsed: Math.floor(elapsed / 1000),
        });

        if (secondsLeft <= 0) {
          if (timerId) clearInterval(timerId);
          timerId = null;
          self.postMessage({ type: 'COMPLETE' });
        }
      }, 100); // 更频繁地更新以提高精度
      break;

    case 'STOP':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      break;

    case 'SYNC':
      // 页面重新可见时，同步时间
      if (timerId && startTime > 0) {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, expectedTime - elapsed);
        const secondsLeft = Math.ceil(remaining / 1000);

        self.postMessage({
          type: 'SYNC',
          timeLeft: secondsLeft,
          elapsed: Math.floor(elapsed / 1000),
        });
      }
      break;
  }
};
