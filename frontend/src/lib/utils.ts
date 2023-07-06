export const getRandomPosition = (maxX: number, maxY: number) => {
  // 2つの値の間の乱数を得るのは Math.random() * (max - min) + min;
  const x = Math.random() * (maxX * 0.8 - maxX * 0.01) + maxX * 0.05;
  const y = Math.random() * (maxY * 0.8 - maxY * 0.1) + maxY * 0.1;
  return { x, y };
};