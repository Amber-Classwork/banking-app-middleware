const Account = require("../schema/account.schema");
const { ObjectId } = require("mongoose").Types;
const { JSONResponse } = require("../utilities/jsonResponse");
class AccountController{
    
    static createAccount = async (req, res, next)=>{
        try{
            let data = req.body;
            if(Object.keys(data).length == 0)throw new Error("No data was passed to create account");
            const account = await new Account(data);
            JSONResponse.success(res,"Account was successfully created", account, 201);
        }catch(error){
            JSONResponse.error(res,"Error creating account", error, 400);
        }
    }

    static getAllAccounts = async(req, res, next)=>{
        try{
            let {username, account_number} = req.query;

            if(username){
                return this.getAccountsByUser(req, res, username);
            }else if(account_number){
                return this.getAccountByAccountNumber(req, res, account_number);
            }
            let accounts = await Account.find();
            JSONResponse.success(res,"Successfully Retrieved all accounts", accounts, 200);

        }catch(error){
            JSONResponse.error(res,"Error retrieving all accounts", error, 404);
        }
    }

    static updateAccount = async(req, res, next)=>{
        try{
            let data = req.body;
            let id = req.params.id;
            if(!ObjectId.isValid(id)) throw new Error ("ID does not match any accounts in database")
            if(Object.keys(data).length == 0){
                return JSON.succes(res, "No data passed to update, file not updated",{}, 200);
            }
            let account = await Account.findByIdAndUpdate(id, data, {new:true});
            if(!account) throw new Error("Account was not found with that ID");
            JSONResponse.success(res, "Account information succesfully updated", account, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to update account",error, 404);
        }
    }

    static deleteAccount = async(req, res, next)=>{
        try{
            let id = req.params.id;
            if(!ObjectId.isValid(id)) throw new Error("ID does not match any accounts in database");
            let account = await Account.findByIdAndDelete(id);
            if(!account) throw new Error("Account was not found with that ID");
            JSONResponse.success(res, "Account information succesfully deleted", account, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to delete account", error, 400);
        }
    }

    static getAccountById = async(req, res, next)=>{
        try{
            let id = req.params.id;
            if(!ObjectId.isValid(id)) throw new Error("ID does not match any accounts in database");
            let account = await Account.findById(id);
            if(!account) throw new Error("Account was not found with that ID");
            JSONResponse.success(res, "Account information succesfully found", account, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to find account", error, 400);
        }
    }

    static getAccountsByUser = async(req, res, username)=>{
        try{
            let accounts = await Account.find({username: username});
            JSONResponse.success(res, "Accounts for user found", accounts, 200)
        }catch(error){
            JSONResponse.error(res, "Cannot find Accounts for user", error, 404);
        }
    }

    static getAccountByAccountNumber = async(req, res, account_number)=>{
        try{
            let account = await Account.findOne({account_number: account_number});
            if(!account) throw new Error("Account was not found with that account number");
            JSONResponse.success(res, "Account for user found", account, 200)
        }catch(error){
            JSONResponse.error(res, "Cannot find Account for user", error, 404);
        }
    }
    
    
}

module.exports = AccountController;
