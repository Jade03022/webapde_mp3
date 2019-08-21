const mongoose = require("mongoose")

let Cinema = mongoose.model("cinema",{
    name : String,
    mall : String,
    city : String,
    movies : [{
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
        schedules : [{
            date : Date,
            showtimes : Array
        }]
    }]
})

module.exports = {
    Cinema
}