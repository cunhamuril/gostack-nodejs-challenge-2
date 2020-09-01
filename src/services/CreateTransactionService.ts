import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const { total } = await getCustomRepository(
      TransactionRepository,
    ).getBalance();

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is invalid!');
    }

    if (type === 'outcome' && value > total) {
      throw new AppError('Can not outcome transaction without a valid balance');
    }

    let transactionCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: transactionCategory.id,
    });

    await transactionsRepository.save(transaction);

    return {
      ...transaction,
      category: transactionCategory,
    };
  }
}

export default CreateTransactionService;
