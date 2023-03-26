export const getSolidityDate = (date: Date) => {
  return Math.floor(date.getTime() / 1000);
};
