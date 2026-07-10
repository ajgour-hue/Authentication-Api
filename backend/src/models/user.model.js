import mongoose from "mongoose";
import bcrypt from "bcrypt";


// schema for user to store in DB 
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId
        }
    },
    fullname: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ["buyer", "seller"],
        default: "buyer"
    },
    googleId: {
        type: String
    },
    refreshToken: {
        type: String,
        default: null
    }
})


// before saving it in DB we are hashing it 
userSchema.pre("save", async function () {

    if (!this.isModified("password")) return;

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash

})

// here we are comparing the password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


// creating model 
const userModel = mongoose.model("User", userSchema);

export default userModel;
