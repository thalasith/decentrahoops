export const dateStringEditor = (date: Date) => {
  const day =
    date.getDate() < 10
      ? "0" + date.getDate().toLocaleString()
      : date.getDate().toLocaleString();
  const month = (date.getMonth() + 1).toLocaleString();
  const year = date.getFullYear().toLocaleString().replace(/,/g, "");

  return year + month + day;
};

export const americanOddsCalculator = (amount: number, total: number) => {
  if (total / amount - 1 >= 2) {
    return (
      "+" +
      ((total / amount - 1) * 100).toLocaleString("en-US", {
        useGrouping: false,
      })
    );
  } else {
    return (
      "-" +
      (100 / (total / amount - 1)).toLocaleString("en-US", {
        useGrouping: false,
      })
    );
  }
};

export const payOutFromAmericanOdds = (amount: number, odds: number) => {
  if (odds > 0) {
    return (odds / 100 + 1) * amount;
  } else {
    return (100 / -odds + 1) * amount;
  }
};
