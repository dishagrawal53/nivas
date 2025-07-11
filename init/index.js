const mongoose=require("mongoose");
const initData=require("./data");
const Listing=require("../models/listing.js");
const MONGO_URL="mongodb://127.0.0.1:27017/nivas";
main()
.then(() =>{
    console.log("connected to db")
})
.catch(()=>{
    console.log(err)
});

async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68642dd96ab8ec1aa7d8f0c3"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};
initDB();