const mongoose = require('mongoose');

const DB = process.env.DATABASE || 'mongodb://127.0.0.1:27017/collaborative-editor';

mongoose.connect(DB)
  .then(() => {
    console.log('Connection Successful');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
