const mongoose = require("mongoose")

let User = mongoose.model("user",{
    username : String,
    password : String,
    type : String,
    mall_managed : String
})

module.exports = {
    User
}