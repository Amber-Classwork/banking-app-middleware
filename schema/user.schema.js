const {model, Schema} = require("mongoose");
const Account = require("../schema/account.schema");
const bcrypt = require("bcrypt");

/**
 * @openapi
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          properties:
 *              id:
 *                  type: mongoose object id as string
 *                  example: 63228ae60e8b432603389f39
 *              username:
 *                  type: string
 *                  example: jdoe65
 *              email:
 *                  type: string
 *                  example: jdoe65@mail.com
 *              password:
 *                  type: string
 *                  example: $3cUrePa$$0rd
 *              id_type:
 *                  type: string
 *                  example: Passport
 *              id_number:
 *                  type: string
 *                  example: A1234567
 *      
 * 
 */
const userSchema = new Schema({
    username : {
        type: String, 
        unique: [true, "Username already exist in the database"]
    },
    email: {
        type: String, 
        unique: [true, "Email already exist in the database"]
    },
    password: {
        type: String, 
        required: [true, "Password was not provided"]
    }, 
    id_type: {
        type: String,
        required: [true, "Type of ID must be present in order to be valid"],
        enum: {
            values: ["NATIONAL", "PASSPORT", "LICENSE"],
            message: "{VALUE} is not valid, it should be either 'NATIONAL', 'PASSPORT', 'LICENSE'"
        },
    },
    id_number: {
        type: String,
        required: [true, "ID must be present in order to be valid"]
    },
    isSuperAdmin:{
        type: Boolean,
        default: false,
    }
   

});


// Middleware function to execute and hash password before saving user into the database.

userSchema.pre("save", async function(){
    try{
        // created a check to make sure account exist for user before user is created.
        let account = await Account.find({username:this.username});
        if(!account) return Promise.reject(new Error("No Account Found for this user"))
        this.id_type = (this.id_type) ? this.id_type.toUpperCase():  undefined;
        this.password = await bcrypt.hash(this.password, 10);
        console.log(this.password)
        this.isSuperAdmin = false;
    }catch(error){
        return Promise.reject(new Error(error.message));
    }
    
});






userSchema.post("save", async function(doc){
    doc = removeSensitiveFields(doc);
});

userSchema.post("findOneAndUpdate", async function(doc,next){    
    try{

    doc.id_type = (doc.id_type) ?doc.id_type.toUpperCase():  undefined;
    doc = await doc.save();
    next()
    }catch(error){
        return Promise.reject(new Error(error.message));
    }
})


// had to do a bunch of acrobatics here. Not sure if it really is the best approach..highly doubt it. The latest condition is trying to zeroin on authenticating user to ensure that document password is not removed before it is processed;

userSchema.post(/^find/, async function(doc){
    if(Array.isArray(doc)){
        for(let file of doc){
            file = removeSensitiveFields(file);
        }
    }else {
        if(!doc) return Promise.reject(new Error("No File found"));
        if(!(this.op == "findOne" && this._conditions.username)) {
            doc = removeSensitiveFields(doc);

        }
    }
});


function removeSensitiveFields(doc){
    doc.isSuperAdmin = undefined;
    doc.password = undefined;   
    return doc
}
// Instance method to check for a password to compare a password with the encrypted password on the instance document.
userSchema.methods.isCorrectPassword = async function(password){
    let isCorrect = await bcrypt.compare(password, this.password);
    return isCorrect;
}

module.exports = model("User", userSchema);