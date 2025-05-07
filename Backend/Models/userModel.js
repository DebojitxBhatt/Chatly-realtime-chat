import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        FullName:{
            type: String,
            required: true
        },
        UserName:{
            type: String,
            required: true,
            unique:true
        },
        Email:{
            type: String,
            required: true
        },
        Password:{
            type: String,
            required: true,
            minlength:6
        },
        gender:{
            type:String,
            required: true,
            enum:["male","female"]
        },
        ProfilePic:{
            type:String,
            required: true,
            default:""


        }
},{timestamp:true});

const User = mongoose.model("User",userSchema)

export default User;