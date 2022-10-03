const router = require('express').Router()
const AccountController = require('../controllers/account.controller');
const Middleware = require('../middlewares/middleware');

router
    .route("/")
    .post(AccountController.createAccount)
    .get(Middleware.isAuthenticated, AccountController.getAllAccounts)

router
    .route("/:id")
    .get(Middleware.isAuthenticated, AccountController.getAccountById)
    .patch(Middleware.isAuthenticated, AccountController.updateAccount)
    .delete(Middleware.isAuthenticated, AccountController.deleteAccount)
    


module.exports = router;