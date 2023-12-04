import error from "./error";

const errorMessage = {
  TRANSACTION_DATE_NOT_FOUND: "Transaction date not found",
  TRANSACTION_SUM_NOT_FOUND: "Transaction sum not found",
  INVALID_TRANSACTION_AMOUNT: "Invalid transaction amount"
}

export default function (counterparties, accounts) {
  return (rawData) => {
    if (!rawData[0]) {
      error(errorMessage.TRANSACTION_DATE_NOT_FOUND);
      return;
    }

    if (!rawData[2]) {
      error(errorMessage.TRANSACTION_SUM_NOT_FOUND);
      return;
    }

    const amount = parseFloat(rawData[2].replace(".", "").replace(",", "."));

    if (isNaN(amount)) {
      error(errorMessage.INVALID_TRANSACTION_AMOUNT);
      return;
    }

    const counterparty = counterparties.find((c) => c.key === rawData[5]);
    const account = accounts.find((a) => a.key === rawData[3]);

    return {
      date: rawData[0],
      category: (counterparty) ? counterparty.category : undefined,
      counterparty: rawData[5],
      counterpartyLabel: (counterparty) ? counterparty.label : undefined,
      outcomeAccount: (amount < 0) ? rawData[3] : undefined,
      outcomeAccountLabel: (amount < 0) ? account.label : undefined,
      outcome: (amount < 0) ? Math.abs(amount) : undefined,
      incomeAccount: (amount >= 0) ? rawData[3] : undefined,
      incomeAccountLabel: (amount >= 0) ? account.label : undefined,
      income: (amount >= 0) ? Math.abs(amount) : undefined,
      comment: rawData[6]
    };
  }
}
