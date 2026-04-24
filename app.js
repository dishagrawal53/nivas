const express = require("express");
const app = express();

require("dotenv").config();

const mongoose = require("mongoose");

const Listing = require("./models/listing.js");
const User = require("./models/user.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");

require("dotenv").config();
const dbUrl=process.env.ATLASDB_URL;

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const sessionOptions ={
    secret:"itsasecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
}
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});
app.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});

}));


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong!"}=err;
 res.status(statusCode).render("error.ejs",{message});
});
async function startServer() {
  try {
    await mongoose.connect(dbUrl);
    console.log(" Connected to DB");

    const PORT = process.env.PORT || 8080;

    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(" DB connection failed:", err);
  }
}

startServer();