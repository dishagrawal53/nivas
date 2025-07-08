const express=require("express");
const router=express.Router({mergeParams:true});
const Listing=require("D:/projects/wanderlust/models/listing.js");
const wrapAsync=require("D:/projects/wanderlust/utils/wrapAsync.js");
const Review=require("D:/projects/wanderlust/models/review.js");
const {isLoggedIn,validateReview,isReviewAuthor}=require("D:/projects/wanderlust/middleware.js");
router.post("/",isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
  let listing= await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);
  newReview.author=req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success","New Review Created!")
  res.redirect(`/listings/${listing._id}`);
}));
router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!")
    res.redirect(`/listings/${id}`);
  })
);
module.exports=router;