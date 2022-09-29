const {model, Schema} = require("mongoose");

const balanceSchema = new Schema({
    account_balance: {type:Number, required: [true, "An account balance should be present at all times"], default: 0}
}, {timestamps:true});

/**
 * ### description
 * Calculate the account balance using the data that passed into the instance method property on the balance schema
 * @param {Transaction} data 
 */
balanceSchema.methods.calculateBalance = async function(data){
    if(!data.transaction_amount) throw new Error("Amount is needed to make transaction");
    if(data.transaction_type == "WITHDRAW"){
        this.account_balance -= data.transaction_amount;
    }else if(data.transaction_type == "DEPOSIT"){
        this.account_balance -= data.transaction_amount;
    }
    this.save();
}

module.exports = model("Balance", balanceSchema);