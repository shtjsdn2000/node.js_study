const express = require('express')
const app = express()
//css파일 있는 폴더 등록하기
app.use(express.static(__dirname + '/public'))


// app.listen : 내 컴퓨터 PORT하나 오픈하는 문법
app.listen(8080,() => {
    console.log('http://localhost:8080에서 서버 실행중')

})

// 8080port로 들어온 사람들에게 다음과 같은 내용을 보여줄것

//html을 띄우는 방법 
//__dirname : 현재 프로젝트의 절대 경로 라는 뜻
app.get('/',(요청,응답)=>{
    응답.sendFile(__dirname + '/index.html')
})
//ep4.웹페이지를 보내주려면(라우팅)
app.get('/first_page',(req,res)=>{
    res.send('first_page')
})

app.get('/news',(req,res)=>{
    res.send('오늘 비옴')
})

//함수 안에 들어가는 함수를 call back함수라고한다.
app.get('/shop',(req,res)=>{
    res.send('쇼핑페이지임')
})

//ep4.숙제
//유저가 /about으로 접속하면
//내 소개용 html 페이지 보내주기
app.get('/about',(req,res)=>{
    res.sendFile(__dirname + '/about.html')
})