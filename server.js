const express = require('express')
const app = express()
//css파일 있는 폴더 등록하기
app.use(express.static(__dirname + '/public'))




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
    //위 주소에 접속하면 db에 저장해보자
    db.collection('post').insertOne({title : '어쩌구'})
    // res.send('오늘 비옴')
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

//ep7.MongoDB와 서버 연결하려면
//MongoDB사용하기 위한 기본 코드임
const {MongoClient} = require('mongodb');
let db;
//'DB접속URL 만 채우면 DB연결 끝'
//mongodb+srv://admin:<password>@cluster0.8vbaxkq.mongodb.net/?retryWrites=true&w=majority
const url = 'mongodb+srv://admin:qwer1234@cluster0.8vbaxkq.mongodb.net/?retryWrites=true&w=majority';
new MongoClient(url).connect().then((client)=>{
    console.log("DB연결성공");
    db = client.db('forum');
    // app.listen : 내 컴퓨터 PORT하나 오픈하는 문법
    app.listen(8080,() => {
        console.log('http://localhost:8080에서 서버 실행중')
})
}).catch((err)=>{
    console.log(err)
})