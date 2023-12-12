const express = require('express')
const app = express()
//css파일 있는 폴더 등록하기
app.use(express.static(__dirname + '/public'))
//ejs 셋팅
app.set('view engine','ejs') 

//req.body를 쓰기위한 코드
app.use(express.json())
app.use(express.urlencoded({extended:true}))



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
    // db.collection('post').insertOne({title : '어쩌구'})
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
//-----------------------------------------------------------------------------------
//ep8. MongoDB에서 데이터 출력하기 (array/object 문법)
//await db.collection('post').find().toArray()
//await를 쓰려면 callback 함수앞에 async를 붙여줘야함
//await : 다음줄 실행하지말고 잠깐 기다려주세요
app.get('/list',async (req,res)=>{
    let result = await db.collection('post').find().toArray()
    //여기서 result라는 배열 속에 0번째(첫번째) docuent에서 title라는 특정한 키값을 선정
//ep9.웹페이지에 DB데이터 꽂기 (EJS, 서버사이드 렌더링)
    //응답은 1개씩만 !~!!
    //    res.render('list.ejs', {작명 : 전송할 데이터})
    res.render('list.ejs', { posts : result} ) //posts 안에 result를 보내라
})
//클라이언트 사이드 렌더링
//1. 빈 html파일 + 데이터만 보내고
//2. 유저 브라우저에서 html 생성해주기

//9강 숙제
app.get('/time',async(req,res)=>{
    res.render('time.ejs',{time: new Date()})
})

app.get('/my profile',async(req,res)=>{
    
})


//11강 notion 참고
//12강 글 작성기능 만들기 1 (POST 요청)

// 1. 글 작성 페이지에서서 글써서 서버로 전송
app.get('/write',async(req,res)=>{
    res.render('write.ejs')
})
// 2. 서버는 글을 검사
//req.vody를 쓰기위해선 상단의 별도의 코드가 필요
// app.post('/add',(req,res)=>{
//     console.log(req.body) //유저가 보낸 데이터 출력가능
// })
// 3. 이상 없으면 DB에 저장 //오늘의 숙제
app.post("/add", function (req, res) {
    console.log(req.body.title);
    console.log(req.body.content);
    var title = req.body.title;
    var content = req.body.content;
    db.collection('post').insertOne({ 제목 : title, 내용 : content}, function(에러, 결과){
            console.log('저장완료');
        });
    });