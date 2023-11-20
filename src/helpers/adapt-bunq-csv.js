const errorMessage = {
  INVALID_TRANSACTION_ARRAY: "Invalid transaction data",
  TRANSACTION_DATE_NOT_FOUND: "Transaction date not found",
  INVALID_TRANSACTION_DATE: "Invalid transaction date",
  TRANSACTION_SUM_NOT_FOUND: "Transaction sum not found",
  INVALID_TRANSACTION_AMOUNT: "Invalid transaction sum"
}

export default function (data) {
  if(data.length !== 7) {
    throw new Error(errorMessage.INVALID_TRANSACTION_ARRAY);
  }

  if (!data[0]) {
    throw new Error(errorMessage.TRANSACTION_DATE_NOT_FOUND);
  }

  const transactionDate = data[0].split('-');

  if (transactionDate.length !== 3) {
    throw new Error(errorMessage.INVALID_TRANSACTION_DATE);
  }

  if (!data[2]) {
    throw new Error(errorMessage.TRANSACTION_SUM_NOT_FOUND);
  }

  const amount = parseFloat(data[2].replace(".", "").replace(",", "."));

  if (isNaN(amount)) {
    throw new Error(errorMessage.INVALID_TRANSACTION_AMOUNT);
  }

  const transaction = {
    date: transactionDate[2] + '.' + transactionDate[1] + '.' + transactionDate[0],
    category: undefined,
    counterparty: data[5],
    outcomeAccount: (amount < 0) ? data[3] : undefined,
    outcome: (amount < 0) ? Math.abs(amount) : undefined,
    incomeAccount: (amount >= 0) ? data[3] : undefined,
    income: (amount >= 0) ? Math.abs(amount) : undefined,
    comment: data[6]
  };

  return transaction;
}
