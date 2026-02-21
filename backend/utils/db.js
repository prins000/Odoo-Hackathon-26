import mongoose from 'mongoose';


let mongoConnection= async()=>{
    try{
        await mongoose.connect(process.env.mongodb_url);
        console.log("Connected successfully");
        
    }catch(err){
        console.log("Connection failed" + err);
    }
}

export default mongoConnection;