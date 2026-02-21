import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongo from './utils/db.js';

import path from 'path';


dotenv.config({});


const app= express();
// Render uses PORT (uppercase), fallback to 6000 for local development
const port=process.env.PORT || 6000;

const corsOptions={
    origin:'http://localhost:5173',
    credentials:true
}

//middelwares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// Serve static files from public directory
app.use('/public', express.static(path.join(process.cwd(), 'public')));



app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
    mongo();
})

