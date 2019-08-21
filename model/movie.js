const mongoose = require("mongoose")

let Movie = mongoose.model("movie",{
    rated: String,
    title : String,
    genre : Array,
    duration : String,
    mpaa_rating : String,
    star_rating : String,
    release_date : Date,
    description : String,
    casts : Array,
    director : String,
    image : String,
})

module.exports = {
    Movie
}