const mongoose = require("mongoose")

let ScreeningHistory = mongoose.model("screening_history",{
    name : String,
    mall : String,
    city : String,
    movies : [{
        title : String,
        genre : Array,
        duration : String,
        mpaa_rating : String,
        star_rating : String,
        release_date : Date,
        description : String,
        casts : Array,
        director : String,
        writers : Array,
        company : String,
        image : String,
        schedules : [{
            date : Date,
            showtimes : Array
        }]
    }]
})

module.exports = {
    ScreeningHistory
}