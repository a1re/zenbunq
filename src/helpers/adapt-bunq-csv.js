const errorMessage = {
  INVALID_TRANSACTION_ARRAY: "Invalid transaction data",
  TRANSACTION_DATE_NOT_FOUND: "Transaction date not found",
  INVALID_TRANSACTION_DATE: "Invalid transaction date",
  TRANSACTION_SUM_NOT_FOUND: "Transaction sum not found",
  INVALID_TRANSACTION_SUM: "Invalid transaction sum"
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

  const transactionSum = parseFloat(data[2].replace(".", "").replace(",", "."));

  if (isNaN(transactionSum)) {
    throw new Error(errorMessage.INVALID_TRANSACTION_SUM);
  }

  const transaction = {
    date: transactionDate[2] + '.' + transactionDate[1] + '.' + transactionDate[0],
    counterpart: data[5],
    sum: Math.abs(transactionSum),
    comment: data[6]
  };

  if (transactionSum < 0) {
    transaction.payer = data[3];
  } else {
    transaction.payee = data[3];
  }

  return transaction;
}
