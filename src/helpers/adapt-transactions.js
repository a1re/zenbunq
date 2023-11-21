import { CSV } from "../config";
import error from "./error";

const errorMessage = {
  INVALID_TRANSACTION_ARRAY: "Invalid transaction data array",
  TRANSACTION_DATE_NOT_FOUND: "Transaction date not found",
  INVALID_TRANSACTION_DATE: "Invalid transaction date",
  TRANSACTION_SUM_NOT_FOUND: "Transaction sum not found",
  INVALID_TRANSACTION_AMOUNT: "Invalid transaction amount"
}

export default function (rawData, counterparties, accounts) {
  const transactions = [];

  for (let i = 0; i < rawData.length; i++) {
    if (i === 0 && CSV.HAS_HEADER) {
      continue;
    }

    if (!Array.isArray(rawData[i]) || rawData[i].length !== CSV.TRANSACTION_LENGTH) {
      error(errorMessage.INVALID_TRANSACTION_ARRAY);
      continue;
    }

    if (!rawData[i][0]) {
      error(errorMessage.TRANSACTION_DATE_NOT_FOUND);
      continue;
    }

    const date = rawData[i][0].split('-');

    if (date.length !== 3) {
      error(errorMessage.INVALID_TRANSACTION_DATE);
      continue;
    }

    if (!rawData[i][2]) {
      error(errorMessage.TRANSACTION_SUM_NOT_FOUND);
      continue;
    }

    const amount = parseFloat(rawData[i][2].replace(".", "").replace(",", "."));

    if (isNaN(amount)) {
      error(errorMessage.INVALID_TRANSACTION_AMOUNT);
      continue;
    }

    const counterparty = counterparties.find((c) => c.key === rawData[i][5]);
    const account = accounts.find((a) => a.key === rawData[i][3]);

    transactions.push({
      date: date[2] + '.' + date[1] + '.' + date[0],
      category: (counterparty) ? counterparty.category : undefined,
      counterparty: rawData[i][5],
      counterpartyLabel: (counterparty) ? counterparty.label : undefined,
      outcomeAccount: (amount < 0) ? rawData[i][3] : undefined,
      outcomeAccountLabel: (amount < 0) ? account.label : undefined,
      outcome: (amount < 0) ? Math.abs(amount) : undefined,
      incomeAccount: (amount >= 0) ? rawData[i][3] : undefined,
      incomeAccountLabel: (amount >= 0) ? account.label : undefined,
      income: (amount >= 0) ? Math.abs(amount) : undefined,
      comment: rawData[i][6]
    });
  }

  return transactions;

}
