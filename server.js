const { compile } = require('ejs')
const express = require('express')
const app = express()
const methodOverride = require('method-override')
//css파일 있는 폴더 등록하기
const bcrypt = require('bcrypt')
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
//ejs 셋팅
app.set('view engine','ejs') 
//req.body를 쓰기위한 코드
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//로그인 기능 구현을 위한 passport라이브러리 기능 구현
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const MongoStore = require('connect-mongo')

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번', //세션의 document id는 암호화 후 유저에게 전송
  resave : false, //유저가 서버로 요청 할 때마다 세션 갱신할 것인지 false가 일방적
  saveUninitialized : false, //로그인 안해도 세션 만들것인지
  //세션 document 유효기간 변경가능
  cookie : {maxAge : 60 * 60 * 1000},
  store : MongoStore.create({
    mongoUrl : 'mongodb+srv://admin:qwer1234@cluster0.8vbaxkq.mongodb.net/?retryWrites=true&w=majority',
    dbName : 'forum',
  })
}))
app.use(passport.session()) 
//--------------------------

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
//MongoDB사용하기위 한 기본 코드임
const {MongoClient,ObjectId} = require('mongodb');
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
    res.render('list.ejs', {posts : result}) //posts 안에 result를 보내라

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
app.post('/add',async(req,res) => {
//req.body : {title: "글제목" , content : "글내용"} 
//console.log(req.body) //유저가 보낸 데이터 출력가능
//13.글 작성기능 만들기 2 (insertOne, 예외 처리)
//예외처리 구현
/*
if (req.body.title == ''){
    res.send ("제목을 채워주세요")
 } else {
   await db.collection('post').insertOne({ title : req.body.title, 
        content : req.body.content})
        res.redirect('/list') //redirect 는 원하는 url로 이동
   }
*/
   try{
//여기코드 실행하고
    if (req.body.title == ""){
        res.send ("제목을 채워주세요")
    } else {
        await db.collection('post').insertOne({ title : req.body.title, 
         content : req.body.content})
        res.redirect('/list') //redirect 는 원하는 url로 이동
   }
   }catch(e){
    //에러뜨면 여기 실행
    //500은 서버 문제로 생긴 오류 라는 뜻
    res.status(500).send('서버에러남')
    console.log(e) // e: 에러메세지 출력해줌
   }
})
	//중괄호 속 데이터 형식은 object 형식으로 넣어야함
    //서버기능 실행 끝나면 항상 응답 필수})
    // 3. 이상 없으면 DB에 저장 //오늘의 숙제

// 14.상세페이지 만들기 1 (URL parameter)
// "(:)" 의 의미 유저가 이자리에 아무문자나 입력시 get 요청 인식 후 콜백함수 실행
// 나의 해답
/*
app.get('/detail/:_id',async(req,res)=>{
    req.params.id = parseInt(req.params.id)
    db.collection('post').findOne({_id : req.params.id},(err, result)=>{
        res.render('detail.ejs',{detail : result})
    })
})
*/
// 16.상세페이지 만들기 2 (링크 만들기)
//모법 답안
//params
// "(:)" 의 의미 유저가 이자리에 아무문자나 입력시 get 요청 인식 후 콜백함수 실행
app.get('/detail/:id',async(req,res)=>{

    try{
    let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id)})
    console.log(req.params.id) //유저가 글번호를 입력하면 params.id에 저장됨
    if (result == null){
        res.status(400).send('이상한 url 입력함')
    }
    res.render('detail.ejs',{result : result})
}  catch(e){
    console.log(e) 
    res.status(404).send('이상한 url 입력함')
    }
})

app.get('/edit/:id', async (req,res)=>{
    let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id) })
    console.log(result)
    res.render('edit.ejs',{result : result})
}) 

app.put('/edit', async (req,res)=>{
    await db.collection('post').updateOne({ _id : new ObjectId(req.body.id)},{$set : {title : req.body.title, content : req.body.content}})
    console.log(req.body)
    res.redirect('/list')
}) 

//document 조작

// app.put('/edit', async (req,res)=>{
//     //$set : 덮어 쓰라는 뜻
//     // await db.collection('post').updateOne({ 수정할 document정보 },{$inc : {수정할 내용}}) //inc 기존값에 +/-하라는 뜻
//     // like > 10 는 다음과 같이 표현 {$gt : 10}
//     await db.collection('post').updateMany({ like : {$gt : 10} } , {$set : { like : 2 }}
//         )
// }) 
app.delete('/delete',async(req,res)=>{
    //db에 있던 document
    let result = await db.collection('post').deleteOne({ _id : new ObjectId(req.query.docid)})
    res.send('삭제완료')
})
//#각 번호 별로 
app.get('/list/:id',async (req,res) => {
    let result = await db.collection('post').find()
        .skip((req.params.id-1)* 5 ).limit(5).toArray()
        res.render('list.ejs', { posts : result }) 

})

app.get('/list/next/:id', async (req, res) => {
    let result = await db.collection('post')
    .find({_id : {$gt : new ObjectId(req.params.id) }})
    .limit(5).toArray()
    res.render('list.ejs', { posts : result })
    console.log(result)
  }) 

  app.get('/login', async (req, res) => {
    res.render('login.ejs')
  }) 
//--------------------------------------------------------
//passport.authenticate('local')()쓰면 아래 코드 실행
  passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    //제출한 아이디/비번 검사하는 코드 적는 곳
    //즉 유저가 입력한 아이디 비번이 db에 있는지 대조한다는 것 
    let result = await db.collection('user').findOne({ username : 입력한아이디})
   
    if (!result) {
      return cb(null, false, { message: '아이디 DB에 없음' })
    }
    //해쉬된 비번과 안된 비번 비교
    await bcrypt.compare(입력한비번, result.password)
    //비번을 db에 있는 비번과 비교
    if (result.password == 입력한비번) {
      return cb(null, result)
    } else {
      return cb(null, false, { message: '비번불일치' });
    }
  }))
  
  passport.serializeUser((user, done) => {
    console.log(user)
    process.nextTick(() => { //내부 코드를 비동기적으로 처리해줌
      done(null, { id: user._id, username: user.username })
    })
  })

  //desrializeUser() : 유저가 보낸 쿠키분석
  passport.deserializeUser(async(user, done) => {
    let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
    delete result.password
    console.log(user)
    process.nextTick(() => { //내부 코드를 비동기적으로 처리해줌
      done(null, result) //이 코드로 인해 req.user를 사용하면 로그인된 유저정보 알려줌
    })
  })
//문제점: 세션 document에 적힌 유저정보를 그대로 req.user에 담아줌

  app.get('/login', async(req,res) => {
    console.log(req.user)
    res.render('login.ejs')
  })


//제출한 아이디 비번이 DB에 있는지 확인하고 있으면 세션 만들어줌
  app.post('/login', async (req, res, next) => {
 //error : 에러시 뭐 들어옴, user : 성공시 뭐 들어옴 info : 실패시 이유
    passport.authenticate('local',(error, user, info)=>{
        if (error) return res.status(500).json(error)
        if (!user) return res.status(401).json(info.message)
        req.logIn(user, (err)=> {
        if(err) return next(err)
        res.redirect('/list')  // 로그인 완료시 실행할 코드
    })
    })(req, res, next)

}) 

//가입기능 만들기
app.get('/register',(req,res)=>{
    res.render('register.ejs')
})

app.post('/register',async(req,res)=>{
//bcrypt 해싱 1번의 1초가 걸림 숫자는 해싱횟수
let 해시 = await bcrypt.hash(req.body.password,10)
console.log(해시)

    await db.collection('user').insertOne({
        username : req.body.username,
        password : 해시
    })
    res.redirect('/')

})