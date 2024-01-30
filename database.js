const{ MongoClient } = require("mongodb");

const url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect() // MongoDB를 연결하는 구간을 connectDB 라는 변수를 만들어 저장함

module.exports = connectDB