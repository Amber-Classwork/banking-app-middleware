const router = require('express').Router();
const TransactionController = require('../controllers/transaction.controller');

router
    .route("/")
    .get(TransactionController.getAllTransactions)
    .post(TransactionController.createTransaction);

router
    .route("/:id")
    .get(TransactionController.getTransactionById)
    .patch(TransactionController.updateTransactionStatus);



module.exports = router;