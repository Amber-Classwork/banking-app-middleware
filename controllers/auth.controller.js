const User = require("../schema/user.schema");
const { JSONResponse } = require("../utilities/jsonResponse");
const { generateJWTToken } = require("../utilities/tokenGenerator");

class AuthController{

    static authenticate = async(req, res, next) =>{
        try{
            let {username, password} = req.body;
            let user = await User.findOne({username: username});
            if(!user) throw new Error("No user present which matches the username");
            if(!(await user.isCorrectPassword(password))) throw new Error("Invalid password");
            user
            let data = user;
            data.password = undefined;
            let token = generateJWTToken({id: user._id, username: user.username}, "3600");
            
            JSONResponse.success(res,"User is authenticated successfully", {user, token}, 200);
        }catch(error){
            JSONResponse.error(res,"User not Authenticated", error, 404);
        }
    }
}

module.exports = AuthController;