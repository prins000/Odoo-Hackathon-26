import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongo from './utils/db.js';
import routes from './routes/index.js';

import path from 'path';

dotenv.config({});

const app = express();
const port = process.env.PORT || 6000;

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/public', express.static(path.join(process.cwd(), 'public')));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FleetFlow API Server',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    mongo();
});

