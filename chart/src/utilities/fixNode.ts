export const fixNode = (newArray: any[]) => {
  const arr: any = [];
  newArray.forEach((res) => {
    if (!arr.find((resp: any) => resp.id === res.source)) {
      arr.push({ id: res.source, sourcelabel: res.sourcelabel });
    }
    if (!arr.find((resp: any) => resp.id === res.target)) {
      arr.push({ id: res.target, targetlabel: res.targetlabel });
    }
  });

  return arr;
};
