import multer from 'multer';
import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionsRepository.getBalance();

  const transactions = await transactionsRepository.find({
    order: {
      created_at: 'DESC',
    },
  });

  return response.json({
    transactions,
    balance,
  });

  /**
   * ABAIXO A FAMOSA GAMBIARRA!!
   */

  // const queryBuilder = transactionsRepository.createQueryBuilder('transaction');

  // const transactionsQuery = await queryBuilder
  //   .select([
  //     'transaction.id',
  //     'transaction.title',
  //     'transaction.value',
  //     'transaction.type',
  //     'category.*',
  //     'transaction.created_at',
  //     'transaction.updated_at',
  //   ])
  //   .innerJoin(
  //     query => {
  //       return query.from(Category, 'category');
  //     },
  //     'category',
  //     'category.id = transaction.category_id',
  //   )
  //   .getRawMany();

  // const formattedTransactions = transactionsQuery.map(transaction => {
  //   return {
  //     id: transaction.transaction_id,
  //     title: transaction.transaction_title,
  //     value: transaction.transaction_value,
  //     type: transaction.transaction_type,
  //     category: {
  //       id: transaction.id,
  //       title: transaction.title,
  //       created_at: transaction.created_at,
  //       updated_at: transaction.updated_at,
  //     },
  //     created_at: transaction.transaction_created_at,
  //     updated_at: transaction.transaction_updated_at,
  //   };
  // });

  // return response.json({
  //   transactions: formattedTransactions,
  //   balance,
  // });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  response.send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
