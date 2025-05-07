export const userRegister=async(req, res)=>{
    try {
        const { FullName, UserName, Email, Password, gender ProfilePic} = req.body;
        const user = await User.findone({username, email});
        if(user) return resizeBy.status(500).send({success:false,message:"Id Already exist"}); 
        const hashPasswrod = bcryptjs.hashSync(Password,10);
        const defaultPic = ProfilePic || "https://ia801308.us.archive.org/8/items/whatsapp-smiling-guy-i-accidentally-made/whatsapp%20generic%20person%20light.jpg";

        const newUser = new User({
            FullName,
            UserName,
            Email,
            Password:hashPassword,
            gender,
            profilepic: default ProfilePic
        })

        if(newUser){
        res.status(201).send({
            _id: newUser._id,
            FullName:newUser.FullName,
            UserName: newUser.username,
            ProfilePic: newUser.ProfilePic,
            Email:newUser.email,

        })
    }

    } catch (error){

    }
}