//라우터로 적용시 필요한코드
const router = require('express').Router() // 1. 다음과 같은 코드를 적는다

let  connectDB = require('./../database.js')

let db;
connectDB.then((client)=>{
    console.log("DB연결성공");
    db = client.db('forum')
}).catch((err)=>{
    console.log(err)
})

router.get('/shirts', async (req,res)=>{ // 2. app.get --> router.get 으로 수정
    await db.collection('post').find().toArray()
    res.send('셔츠파는 페이지임')
  })
  
router.get('/pants',(res,req)=>{
    res.send('바지파는 페이지임')
  })

module.exports = router // 3.다음과 같은 코드를 적는다.

//4. server.js로 require해야함 
