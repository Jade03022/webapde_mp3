const express  = require("express")
const bodyparser = require("body-parser")
const session = require("express-session")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")
const bb = require("express-busboy")
const cryptojs = require("crypto-js")

const {User} = require(__dirname + "/model/user.js")
const {Movie} = require(__dirname + "/model/movie.js")
const {Cinema} = require(__dirname + "/model/cinema.js")
const {ScreeningHistory} = require(__dirname + "/model/screening_history.js")

const app = express()
const image_dest = "public/"

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/db",{
    useNewUrlParser : true
})

const urlencoder = bodyparser.urlencoded({
    extended:false
})

app.use(express.static(__dirname + "/public"))

app.use(session({
    secret : "secret name",
    name : "click the city",
    resave : true,
    saveUninitialized : true,
    cookie:{
        maxAge : 1000*60*60*24*365
    }
}))

app.use(cookieparser())

bb.extend(app,{
    upload: true,
    path: __dirname  +"/"+ image_dest,
    allowedPath: /./
})

//app.get("/", (req,res)=>{
//    res.render("index.hbs")
//})
//
//app.post("/register", urlencoder, (req,res)=>{
//    console.log("POST /register")
//    console.log(req.files.imgmovie.uuid)
//    console.log(req.files.imgmovie.field)
//    console.log(req.files.imgmovie.filename)
//    
//    res.render("photo.hbs", {
//        filename :  "/" + req.files.imgmovie.uuid 
//                    + "/" + req.files.imgmovie.field 
//                    + "/" + req.files.imgmovie.filename  
//    })
//})
app.get("/", (req,res)=>{
//    new Movie({      
//        title : "Fast and Furious Presents: Hobbs and Shaw",
//        genre : ["Action"],
//        duration : "2hrs 23mins",
//        mpaa_rating : "4.7",
//        star_rating : "4.1",
//        release_date : "2019-08-20",
//        description : "Lawman Luke Hobbs and outcast Deckard Shaw form an unlikely alliance when a cyber-genetically enhanced villain threatens the future of humanity.",
//        casts : ["Dwayne Johnson","Jason Statham"],
//        director : "David Leitch",
//        writers : ["Dwayne Johnson","Jason Statham"],
//        company : "Seven Bucks Productions",
//        image : "none"
//    }).save().then((doc)=>{
//        console.log(doc)
//    }, (err)=>{
//        console.log(err)
//    })

//    new User({      
//        username : "sm_cash",
//        password : cryptojs.AES.encrypt("cash","password_key"),
//        type : "moderator",
//        mall_managed : "Cash and Carry"
//    }).save().then((doc)=>{
//        console.log(doc)
//    }, (err)=>{
//        console.log(err)
//    })
    
    if(req.cookies["current_user"]){
        if(req.cookies["current_user"] == "admin")
            res.redirect("/nowShowingAdminPage")
        else
            res.redirect("/nowShowingModeratorPage")
    }
    else
        res.redirect("/nowShowingUserPage")
})

app.get("/brand_click", (req,res)=>{
    res.redirect("/")
})

app.get("/nowShowingUserPage", (req,res)=>{
    var date = new Date();

    date.setDate(date.getDate() + 1);
    
    Movie.find({
        release_date: { $gte: '2000-01-01', $lte: date }
    }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("nowShowingUserPage.hbs", {
                movies: doc
            })
        }
    })
})

app.get("/upcomingMoviesUserPage", (req,res)=>{
    var date = new Date();
    var datefuture = new Date();
    
    datefuture.setFullYear(date.getFullYear() + 50);

    Movie.find({
        release_date: { $gte: date, $lte: datefuture }
    }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("upcomingMoviesUserPage.hbs", {
                movies: doc
            })
        }
    })
})

app.get("/loginpage", (req,res)=>{
    res.render("login.hbs")
})

app.get("/cinemasByCityUserPage", (req,res)=>{
    res.render("cinemasByCityUserPage.hbs")
})

app.get("/cinemasByMallUserPage", (req,res)=>{
    res.render("cinemasByMallUserPage.hbs")
})

app.get("/cinemasUserPage", (req,res)=>{
     let mall = req.query.mall
    
     var prevdate = new Date();
     var nextdate = new Date();

     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);

     Cinema.find({
         "movies.schedules.date": { $gte: prevdate, $lte: nextdate },
          mall: mall
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            console.log(doc)
            console.log(mall)
            res.render("cinemasUserPage.hbs", {
                cinemas: doc,
                date: formatDate(new Date(Date.now())),
                mally: mall
            })
        }
    })
})

app.get("/cinemaCityUserPage", (req,res)=>{
    let city = req.query.city
    
     var prevdate = new Date();
     var nextdate = new Date();

     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);

     Cinema.find({
         "movies.schedules.date": { $gte: prevdate, $lte: nextdate },
          city: city
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("cinemaCityUserPage.hbs", {
                cinemas: doc,
                date: formatDate(new Date(Date.now())),
                citty: city
            })
        }
    })
})


app.get("/nowShowingModeratorPage", (req,res)=>{
    var date = new Date();

    date.setDate(date.getDate() + 1);
    
    Movie.find({
        release_date: { $gte: '2000-01-01', $lte: date }
    }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("nowShowingModeratorPage.hbs", {
                username: req.cookies["current_user"],
                movies: doc
            })
        }
    })
})

app.get("/upcomingMoviesModeratorPage", (req,res)=>{
    var date = new Date();
    var datefuture = new Date();
    
    datefuture.setFullYear(date.getFullYear() + 50);

    Movie.find({
        release_date: { $gte: date, $lte: datefuture }
    }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("upcomingMoviesModeratorPage.hbs", {
                username: req.cookies["current_user"],
                movies: doc
            })
        }
    })
})

app.get("/viewScreeningModeratorPage", (req,res)=>{
    var date = new Date();
    
    User.findOne({
        username: req.cookies["current_user"]
    }, (err, docs)=>{
        if(err)
           res.send(err)
        else{
            Cinema.find({
                mall: docs.mall_managed
            }, (err,doc)=>{
                if(err){
                   res.send(err)
                }else{
                    res.render("viewScreeningModeratorPage.hbs", {
                        username: req.cookies["current_user"],
                        screens: doc,
                        date: formatDate(new Date(date)),
                        mallman: docs.mall_managed
                    })
                }
            })
        }    
    })
})

app.get("/addScreeningModeratorPage", (req,res)=>{
    Movie.find({}, (err,docs)=>{
        if(err){
           res.send(err)
        }else{
            User.findOne({
                username: req.cookies["current_user"]
            }, (err, docss)=>{
                if(err)
                   res.send(err)
                else{
                    Cinema.find({
                        mall: docss.mall_managed
                    }, (err,doc)=>{
                        if(err){
                           res.send(err)
                        }else{
                            res.render("addScreeningModeratorPage.hbs", {
                                username: req.cookies["current_user"],
                                movies: docs,
                                cinemas: doc
                            })
                        }
                    })
                }    
            })
        }
    })
})

app.get("/editScreeningModeratorPage", (req,res)=>{
    Cinema.findOne({
        "movies._id" : req.query.id
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            Movie.find({}, (err,docs)=>{
                if(err){
                   res.send(err)
                }else{
                    res.render("editScreeningModeratorPage.hbs", {
                        username: req.cookies["current_user"],
                        movies: docs,
                        movid: req.query.id
                    })
                }
            })
        }
    })
})

app.get("/cinemasmoderator", (req,res)=>{
     var prevdate = new Date();
     var nextdate = new Date();
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gte: prevdate, $lte: nextdate }
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("cinemasModeratorPage.hbs", {
                username: req.cookies["current_user"],
                cinemas: doc,
                date: formatDate(new Date(Date.now()))
            })
        }
    })
})

app.get("/nowShowingAdminPage", (req,res)=>{
    var date = new Date();

    date.setDate(date.getDate() + 1);
    
    Movie.find({
        release_date: { $gte: '2000-01-01', $lte: date }
    }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("nowShowingAdminPage.hbs", {
                username: req.cookies["current_user"],
                movies: doc
            })
        }
    })
})

app.get("/upcomingMoviesAdminPage", (req,res)=>{
    var date = new Date();
    var datefuture = new Date();
    
    datefuture.setFullYear(date.getFullYear() + 50);

    Movie.find({
        release_date: { $gte: date, $lte: datefuture }
    }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("upcomingMoviesAdminPage.hbs", {
                username: req.cookies["current_user"],
                movies: doc
            })
        }
    })
})

app.get("/viewMoviesAdminPage", (req,res)=>{
    Movie.find({}, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("viewMoviesAdminPage.hbs", {
                username: req.cookies["current_user"],
                movies: doc
            })
        }
    })
})

app.get("/addMoviesAdminPage", (req,res)=>{
    res.render("addMoviesAdminPage.hbs")
})

app.get("/editMovieAdminPage", (req,res)=>{
    Movie.findOne({
        _id : req.query.id
    }, (err,doc)=>{
        if(err){
            res.send(err)
        }else{
            res.render("editMovieAdminPage.hbs",{
                movie:doc
            })
        }
    })
})

app.get("/cinemasAdminPage", (req,res)=>{
     var prevdate = new Date();
     var nextdate = new Date();
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gte: prevdate, $lte: nextdate }
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            console.log(doc)
            res.render("cinemasAdminPage.hbs", {
                username: req.cookies["current_user"],
                cinemas: doc,
                date: formatDate(new Date(Date.now()))
            })
        }
    })
})

app.post("/searchAdmin", (req,res)=>{
     let dater = req.body.dater
     var prevdate = new Date(dater);
     var nextdate = new Date(dater);
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gt: prevdate, $lt: nextdate }
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("cinemasAdminPage.hbs", {
                username: req.cookies["current_user"],
                cinemas: doc,
                date: formatDate(new Date(dater))
            })
        }
    })
})

app.post("/searchUserMall", (req,res)=>{
     let dater = req.body.dater
     let mall = req.body.mally
     
     var prevdate = new Date(dater);
     var nextdate = new Date(dater);
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gt: prevdate, $lt: nextdate },
          mall: mall
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("cinemasUserPage.hbs", {
                cinemas: doc,
                date: formatDate(new Date(dater))
            })
        }
    })
})

app.post("/searchUserCity", (req,res)=>{
     let dater = req.body.dater
     let city = req.body.citty
     
     var prevdate = new Date(dater);
     var nextdate = new Date(dater);
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gt: prevdate, $lt: nextdate },
          city: city
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("cinemaCityUserPage.hbs", {
                cinemas: doc,
                date: formatDate(new Date(dater)),
                citty: city
            })
        }
    })
})

app.post("/searchModerator", (req,res)=>{
     let dater = req.body.dater
     
     var prevdate = new Date(dater);
     var nextdate = new Date(dater);
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gt: prevdate, $lt: nextdate }
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            res.render("cinemasModeratorPage.hbs", {
                cinemas: doc,
                date: formatDate(new Date(dater))
            })
        }
    })
})

app.post("/searchScreen", (req,res)=>{
     let dater = req.body.dater
     let mallman = req.body.mallman
     
     var prevdate = new Date(dater);
     var nextdate = new Date(dater);
    
     prevdate.setDate(prevdate.getDate() - 1);
     nextdate.setDate(nextdate.getDate() + 1);
    
     Cinema.find({
         "movies.schedules.date": { $gt: prevdate, $lt: nextdate },
          mall: mallman
     }, (err,doc)=>{
        if(err){
           res.send(err)
        }else{
            console.log(mallman)
            res.render("viewScreeningModeratorPage.hbs", {
                screens: doc,
                date: formatDate(new Date(dater)),
                mallman: mallman
            })
        }
    })
})

app.post("/editscreen", urlencoder,(req,res)=>{
    let movie = req.body.movie
    
    Movie.findOne({
        title: movie
    }, (err,docs)=>{
        if(err){
           res.send(err)
        }else{
            Cinema.updateOne({
                "movies._id" : req.body.id
            }, {
                movies: docs
            }, (err, doc)=>{
                if(err){
                    res.send(err)
                }else{
                    res.redirect("/viewScreeningModeratorPage")
                }
            })
        }
    })
})

app.post("/addscreen", urlencoder,(req,res)=>{
    let movie = req.body.movie
    let cinema = req.body.cinema
    let showtime = req.body.showtime
    
    
    
    res.redirect("/viewScreeningModeratorPage")
})

app.post("/deletescreen", urlencoder,(req,res)=>{
    Cinema.deleteOne({
        "movies._id" : req.body.id
    } ,(err,doc)=>{
        if(err){
            res.send(err)
        }else{
            res.redirect("/viewScreeningModeratorPage")
        }
    })
})


app.post("/editmovie", urlencoder,(req,res)=>{
    let movietitle = req.body.movietitle
    let rated = req.body.rated
    let duration = req.body.duration
    let genre = req.body.genre
    let summary = req.body.summary
    let critrate = req.body.critrate
    let userrate = req.body.userrate
    let cast = req.body.cast
    let director = req.body.director
    let casts = []
    let genres = []
    let ratedfile = ""

    casts = cast.split(",")
    genres = genre.split(",")
    
    if(rated == "G")
        ratedfile = "/0d4e42ae-c001-4331-903d-e333d4efa00a/imgmovie/ratedg.jpg"
    else if(rated == "PG")
        ratedfile = "/bbe9dcb1-27c0-4004-adf8-e9a772c84f76/imgmovie/ratedpg.jpg"
    else if(rated == "R-13")
        ratedfile = "/53080207-e8dd-4c2a-ab17-9455a3da7aad/imgmovie/ratedr13.jpg"
    else
        ratedfile = "/c3e67219-fa39-41f1-95b0-2f91c28da3ef/imgmovie/ratedr16.jpg"
    
    Movie.updateOne({
        _id : req.body.id
    }, {
        title : movietitle,
        rated : ratedfile,
        genre : genres,
        duration : duration,
        mpaa_rating : critrate,
        star_rating : userrate,
        description : summary,
        casts : casts,
        director : director
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }else{
            res.redirect("/viewMoviesAdminPage")
        }
    })
})

app.post("/addmovie", urlencoder,(req,res)=>{
    let movietitle = req.body.movietitle
    let releasedate = req.body.releasedate
    let rated = req.body.rated
    let duration = req.body.duration
    let genre = req.body.genre
    let summary = req.body.summary
    let critrate = req.body.critrate
    let userrate = req.body.userrate
    let cast = req.body.cast
    let director = req.body.director
    let casts = []
    let genres = []
    let ratedfile = ""
    let photofile = ""
    
    casts = cast.split(",")
    genres = genre.split(",")
    
    if(rated == "G")
        ratedfile = "/0d4e42ae-c001-4331-903d-e333d4efa00a/imgmovie/ratedg.jpg"
    else if(rated == "PG")
        ratedfile = "/bbe9dcb1-27c0-4004-adf8-e9a772c84f76/imgmovie/ratedpg.jpg"
    else if(rated == "R-13")
        ratedfile = "/53080207-e8dd-4c2a-ab17-9455a3da7aad/imgmovie/ratedr13.jpg"
    else
        ratedfile = "/c3e67219-fa39-41f1-95b0-2f91c28da3ef/imgmovie/ratedr16.jpg"
    
    photofile = "/" + req.files.imgmovie.uuid + "/" + req.files.imgmovie.field + "/" + req.files.imgmovie.filename 

    new Movie({      
        title : movietitle,
        rated : ratedfile,
        genre : genres,
        duration : duration,
        mpaa_rating : critrate,
        star_rating : userrate,
        release_date : releasedate,
        description : summary,
        casts : casts,
        director : director,
        image : photofile
    }).save().then((doc)=>{
        res.redirect("/viewMoviesAdminPage")
    }, (err)=>{
        res.send(err)
    })
})

app.post("/deletemovie", urlencoder,(req,res)=>{
    Movie.deleteOne({
        _id : req.body.id
    } ,(err,doc)=>{
        if(err){
            res.send(err)
        }else{
            res.redirect("/viewMoviesAdminPage")
        }
    })
})

app.post("/login", urlencoder,(req,res)=>{
    let username = req.body.un
    let password = req.body.pw
    
    User.findOne({
        username: username
    }, (err, doc)=>{
        if(err)
           res.send(err)
        else if(!doc){
            res.render("login.hbs", {
                invalid_credentials: "Invalid username or password!"
            })
        }
        else{
            var passwordFromForm = password
            
            var passwordFromDBbytes = cryptojs.AES.decrypt(doc.password,"password_key")
            var passwordFromDBplain = passwordFromDBbytes.toString(cryptojs.enc.Utf8)
            
            if(passwordFromForm != passwordFromDBplain){
                    res.render("login.hbs", {
                        invalid_credentials: "Invalid username or password!"
                    })
            }
            else{
               if(doc.type == "admin"){
                    res.cookie("current_user", doc.username, {
                        maxAge : 1000*60*60*24*365
                    })

                    res.redirect("/nowShowingAdminPage")
                }else{
                    res.cookie("current_user", doc.username, {
                        maxAge : 1000*60*60*24*365
                    })

                    res.redirect("/nowShowingModeratorPage")
                } 
            }   
        }    
    })
})

app.get("/logout", (req, res)=>{
    res.clearCookie("current_user")
    res.redirect("/")
})

app.listen(3000, ()=>{
    console.log("live at port 3000")
})

function formatDate(date){
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November','December'];
    
    var formattedDate = days[date.getDay()] + ', ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
    
    return formattedDate
}