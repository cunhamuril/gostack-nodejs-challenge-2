import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomes = transactions
      .filter(transaction => transaction.type === 'income')
      .map(transaction => Number(transaction.value));

    const outcomes = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(transaction => Number(transaction.value));

    const income = incomes.reduce((acc, item) => acc + item, 0);
    const outcome = outcomes.reduce((acc, item) => acc + item, 0);
    const total = income - outcome;

    const balance = {
      income,
      outcome,
      total,
    };

    return balance;
  }
}

export default TransactionsRepository;
