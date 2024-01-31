const router = require('express').Router() // 1. 다음과 같은 코드를 적는다

//이런 미들웨어는 여러개 삽입 가능
function checkLogin (req, res, next){
    if(!req.user){
      res.send('로그인하세여') //응답해버리면 남은코드 실행 안됨
    }
    next() // next() 가 없으면 함수 무한 반복
  }
  // Q. API 100개에 미들웨어 전부 적용하고 싶다면?
  router.use('/URL',checkLogin)// 여기 밑에 있는 모든 API는 checkLogin 미들웨어 젹용됨
  

router.get('/sub/sports',checkLogin,(req,res)=>{
    res.send('스포츠 게시판')
})

router.get('/sub/game',checkLogin,(req,res)=>{
    res.send('게임 게시판')
})

module.exports = router