const express=require("express");
const router=express.Router();
const Listing=require("D:/projects/wanderlust/models/listing.js");
const wrapAsync=require("D:/projects/wanderlust/utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("D:/projects/wanderlust/middleware.js");

router.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
router.get("/new",isLoggedIn,async(req,res)=>{
  res.render("listings/new.ejs");
});
router.post("/",isLoggedIn,validateListing,wrapAsync(async(req,res,next)=>{ 
  const newListing= new Listing(req.body.listing);
  newListing.owner=req.user._id;
  await newListing.save();
  req.flash("success","New listing created!");
  res.redirect("/listings");
}));

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
 let {id}=req.params;
 const listing=await Listing.findById(id);
  if(!listing){
  req.flash("error","Listing you requested does not exist!");
  return res.redirect("/listings");
 }
  res.render("listings/edit.ejs",{listing});
}));


router.get("/:id",wrapAsync(async(req,res)=>{
 let {id}=req.params;
 const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
 if(!listing){
  req.flash("error","Listing you requested does not exist!");
  return res.redirect("/listings");
 }
  res.render("listings/show.ejs",{listing});

}));
router.put("/:id",isLoggedIn,isOwner,validateListing,wrapAsync(async(req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
  req.flash("success","Listing Updated!")
  res.redirect(`/listings/${id}`);

}
));
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
 let {id}=req.params;
 let delListing=await Listing.findByIdAndDelete(id);
 console.log(delListing);
 req.flash("success","Listing Deleted!")
  res.redirect("/listings");
}));
module.exports=router;