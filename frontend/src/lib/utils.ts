export const createRandomArrayN = (arr: any[], n: number) => {
  if (n > arr.length) {
    throw new Error('指定された要素数が配列の長さを超えています');
  }

  const shuffled = arr.slice(); // 配列Aのコピーを作成
  const selected = [];

  // 配列AからランダムにN個の要素を選択
  while (selected.length < n) {
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    const selectedElement = shuffled.splice(randomIndex, 1)[0];
    selected.push(selectedElement);
  }

  // 選択された要素をランダムに並び替え
  const shuffledSelected = [];
  while (selected.length > 0) {
    const randomIndex = Math.floor(Math.random() * selected.length);
    const selectedElement = selected.splice(randomIndex, 1)[0];
    shuffledSelected.push(selectedElement);
  }

  return shuffledSelected;
}

export const getRandomPosition = (maxX: number, maxY: number, minX=maxX * 0.01, minY=maxY * 0.1) => {
  // 2つの値の間の乱数を得るのは Math.random() * (max - min) + min;
  const x = Math.random() * (maxX * 0.8 - minX) + minX;
  const y = Math.random() * (maxY * 0.8 - minY) + minY;
  return { x, y };
};

export const getWindowRandomPosition = (maxX: number, maxY: number) => {
  // 2つの値の間の乱数を得るのは Math.random() * (max - min) + min;
  const x = Math.random() * (maxX * 0.8 - maxX * 0.01) + maxX * 0.05;
  const y = Math.random() * (maxY * 0.8 - maxY * 0.05) + maxY * 0.05;
  return { x, y };
};

export const getCellPosition = (width: number, height: number, count: number, max_image_num: number) => {
  // 0~8のそれぞれにエリアをふる
  // 0~3は上段、4~7は下段
  // 0~3と4~7の順で左からエリアをふる
  // 数字を8で割った数字が上下を表し、あまりが左右を表す
  const line = Math.floor(count / (max_image_num / 2));
  const cel = count % (max_image_num / 2);
  const celWidth = width / 4;
  const lineHeight = height / 2;
  // マス目の±20%の範囲でランダムに動かす
  const minX = celWidth * cel + (celWidth * 0.3);
  const minY = lineHeight * line + (lineHeight * 0.1);
  const maxX = minX + celWidth - (celWidth * 0.3);
  const maxY = minY + lineHeight - (lineHeight * 0.4);
  return getRandomPosition(maxX, maxY, minX, minY);
}