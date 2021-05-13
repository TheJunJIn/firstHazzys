/**
 * @param {number} x
 * @returns {number}
 */
export function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}

/**
 * 특정 시간동안 시작 값에서 목표 값까지 변한 값을 `tick` 함수에 전달하는 간단한 애니메이션 함수
 *
 * @param {Object} param
 * @param {number} param.from
 * @param {number} param.to
 * @param {number} param.duration
 * @param {(x: number) => number} param.easing
 * @param {(timestamp: number) => void} tick
 * @returns {Promise}
 */
export default function animate(
  { from, to, duration, easing = (x) => x } = {},
  tick
) {
  const distance = to - from;
  let startTime;

  return new Promise((resolve) => {
    const step = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
      }
      const elapsedTime = timestamp - startTime;
      const value =
        from + distance * easing(Math.min(1, elapsedTime / duration));

      tick(value);

      if (elapsedTime < duration) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
}
