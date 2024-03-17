import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,         // cloudinary url
        required: true
    },
    coverImage: {
        type: String,    //cloudniary url
    },
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "video"
    }],
    password: {
        type: String,
        required: [true,'password is required']
    },
    refreshToken: {
        type: String
    }

},{timestamps: true})


userSchema.pre("save",async function (next){         // this code will check if password change then it will 
    if(!this.isModified("password"))return next();   // bcrypt the new password other wise return next() which is like
                                                     //  a pointer to the next middleware                                         
    this.password = await bcrypt.hash(this.password, 10);
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){    // here isPasswordCorrect is a method or like hook or like middleware
   return await bcrypt.compare(password,this.password)             // it return true of false
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    }, process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
    }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
       
    }, process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
    }
    )
}

export const User = mongoose.model("User",userSchema)



// In summary, this code sets up a user model schema in Mongoose, defines middleware
// to hash passwords before saving, and provides methods to generate JWT-based access 
// and refresh tokens for user authentication and authorization.