const Account = require("../schema/account.schema");
const Balance = require("../schema/balance.schema");
const { ObjectId } = require("mongoose").Types;
const { JSONResponse } = require("../utilities/jsonResponse");
const { randomNumberGenerator } = require("../utilities/randomNumbersGenerator");

class AccountController{
    
    static createAccount = async (req, res, next)=>{
        let accountBal = "";
        try{
            let data = req.body;
            data.id_type = (data.id_type) ? data.id_type.toUpperCase() : undefined;
            if(!data.id_type) throw new Error("No ID type was given"); 
            if(Object.keys(data).length == 0)throw new Error("No data was passed to create account");
            let account = new Account(data);
            accountBal = await this.generateBalanceId(data);
            account.account_balance = accountBal;
            account.account_number = await this.generateAccountNumber(accountBal, 8);
            let savedAccount = await account.save();
            account;
            savedAccount.populate("account_balance");
            JSONResponse.success(res,"Account was successfully created", savedAccount, 201);
        }catch(error){
            // probably need to wrap this in another try block
            if(accountBal){
                this.cleanUpBalance(accountBal)
            }
            JSONResponse.error(res,"Error creating account", error, 400);
        }
        
    }

    static generateBalanceId = async (data)=>{
            if (data.account_balance){
                if(ObjectId.isValid(data.account_balance)){
                    throw new Error("Unable to create account please check form data")
                }else{
                    throw new Error("Unable to create account something happened")
                }
            }else{
                let balance = await new Balance().save();
                
                return balance._id;
            }
    }

    static cleanUpBalance = async (balance_id)=>{
            let balance = await Balance.findById(balance_id);
            if(balance.account_balance > 100){
                throw new Error("Unable to delete account with greater than $100");
            }else{
                await balance.delete();
            }
        
    }

    /**
     * ### Generates a random number using a substring of the data that is passed in. If the number exist already as a account number it will try again until it finds a unique number
     * @param {string} data 
     * @param {number} length 
     */
    static generateAccountNumber = async (data, length)=>{
            let prefix = data.toString().slice(0, 3);
            let accountNumber = randomNumberGenerator(prefix, length);
            while(true){
                if(!(await this.accountNumberExists(accountNumber))){
                    break;
                }
                accountNumber = randomNumberGenerator(prefix, length);
            }
            return accountNumber;   
    }

    static getAllAccounts = async(req, res, next)=>{
        try{
            let {username, account_number} = req.query;
            if(username){
                return this.getAccountsByUser(req, res, username);
            }else if(account_number){
                return this.getAccountByAccountNumber(req, res, account_number);
            }
            let accounts = await Account.find({});
            JSONResponse.success(res,"Successfully Retrieved all accounts", accounts, 200);

        }catch(error){
            JSONResponse.error(res,"Error retrieving all accounts", error, 404);
        }
    }

    // static populateAutoProperties = async (data)=>{
    //     let wBalance = await this.generateBalance(data);
    //     wBalance.account_number = await this.generateAccountNumber(wBalance.account_balance, 8);
    //     return wBalance;
    // }
    static updateAccount = async(req, res, next)=>{
        try{
            let data = req.body;
            let id = req.params.id;
            data.account_number = undefined;
            data.id_type = (data.id_type) ? data.id_type.toUpperCase() : undefined;
            if(!ObjectId.isValid(id)) throw new Error ("ID does not match any accounts in database");
            if(Object.keys(data).length == 0){
                return JSON.succes(res, "No data passed to update, file not updated",{}, 200);
            }
            if(data.account_balance){
                data.account_balance = undefined;
            }
            let account = await Account.findByIdAndUpdate(id, data, {new:true}).populate("account_balance", {"account_balance": 1});
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
            let account = await Account.findOne({_id: id});
            if(!account) throw new Error("Account was not found with that ID");
            await this.cleanUpBalance(account.account_balance);
            account.delete();
            JSONResponse.success(res, "Account information succesfully deleted", account, 200);
        }catch(error){
            JSONResponse.error(res, "Unable to delete account", error, 400);
        }
    }

    static getAccountById = async(req, res, next)=>{
        try{
            let id = req.params.id;
            if(!ObjectId.isValid(id)) throw new Error("ID does not match any accounts in database");
            let account = await Account.findOne({_id:id});
            if(!account) throw new Error("Account was not found with that ID");
            console.log(account)
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

     
    /**
     * ### Description
     * This  method compares an accountNumber passed in to all the accounts in the database. If there is an account with that number, it will return false. Otherwise, it will return true.
     * @param {string} accountNumber 
     * @returns {Promise<boolean>}
     */
     static accountNumberExists = async (accountNumber)=>{
        const accounts =  await Account.find({account_number: accountNumber});
        if(accounts.length > 0){
            return true;
        }
        return false;
    
    }
    
    
}

module.exports = AccountController;
