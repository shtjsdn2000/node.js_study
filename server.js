const { compile } = require('ejs')
const express = require('express')
const app = express()
const methodOverride = require('method-override')
//css파일 있는 폴더 등록하기
const bcrypt = require('bcrypt')
const date = new Date();

//socket.io세팅 문구
const { createServer } = require('http')
const { Server } = require('socket.io')
const server = createServer(app)
const io = new Server(server) 


require('dotenv').config()
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
  secret: process.env.PW, //세션의 document id는 암호화 후 유저에게 전송
  resave : false, //유저가 서버로 요청 할 때마다 세션 갱신할 것인지 false가 일방적
  saveUninitialized : false, //로그인 안해도 세션 만들것인지
  //세션 document 유효기간 변경가능
  cookie : {maxAge : 60 * 60 * 1000},
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : 'forum',
  })
}))
app.use(passport.session()) 
//---------------------------
//AWS 셋팅
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.S3_KEY,
      secretAccessKey : process.env.S3_SECRET,
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'shtjsdnforum1',
    key: function (req, file, cb) {
      cb(null, Date.now().toString()) //업로드시 파일명 변경가능
    }
  })
})
//-----------------------------------------------------

//--------------------------
// 8080port로 들어온 사람들에게 다음과 같은 내용을 보여줄것

//이런 미들웨어는 여러개 삽입 가능
function checkLogin (req, res, next){
  if(!req.user){
    res.send('로그인하세여') //응답해버리면 남은코드 실행 안됨
  }
  next() // next() 가 없으면 함수 무한 반복
}
// Q. API 100개에 미들웨어 전부 적용하고 싶다면?
app.use('/URL',checkLogin)// 여기 밑에 있는 모든 API는 checkLogin 미들웨어 젹용됨

function time (req,res,next){
console.log(date)
  next()
}
app.use('/list',time)
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
// const connectDB = require('./database.js')

let connectDB = require('./database.js')
let db;
let changeStream
//'DB접속URL 만 채우면 DB연결 끝'
//mongodb+srv://admin:<password>@cluster0.8vbaxkq.mongodb.net/?retryWrites=true&w=majority
connectDB.then((client)=>{
    console.log("DB연결성공");
    db = client.db('forum');
    let 조건 = [ //get요철할 떄마다 실행할 필요는 없을 듯
  { $match : { operationType : 'insert'} }
]
  //change stream 사용법
  changeStream =  db.collection('post').watch(조건) // 1.postcollection의 변동사항 발생시 알려줌 
    // app.listen : 내 컴퓨터 PORT하나 오픈하는 문법
    server.listen(process.env.PORT,() => {
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
//req.body를 쓰기위해선 상단의 별도의 코드가 필요
app.post('/add',async(req,res) => {
console.log(req.user)
  upload.single('img1')(req,res,(err)=>{
    if (err) return res.send('업로드에러')
    //(이미지 업로드 완료시 실행할 코드 입력 구간)
    try{
      //여기코드 실행하고
          if (req.body.title == ""){
              res.send ("제목을 채워주세요")
          } else {
              db.collection('post').insertOne(
              { 
              title : req.body.title, 
              content : req.body.content, 
              img : req.file ? req.file.location : '', 
              user : req.user._id,
              username : req.user.username
              })
              res.redirect('/list') //redirect 는 원하는 url로 이동
        }
        }catch(e){
          //에러뜨면 여기 실행
          console.log(e) // e: 에러메세지 출력해줌
          //500은 서버 문제로 생긴 오류 라는 뜻
          res.status(500).send('서버에러남')
        }
  
  })

    
    
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
/* //on off
   try{
//여기코드 실행하고
    if (req.body.title == ""){
        res.send ("제목을 채워주세요")
    } else {
        await db.collection('post').insertOne({ 
        title : req.body.title, 
        content : req.body.content, 
        img : req.file.location
        })
        res.redirect('/list') //redirect 는 원하는 url로 이동
   }
   }catch(e){
    //에러뜨면 여기 실행
    //500은 서버 문제로 생긴 오류 라는 뜻
    res.status(500).send('서버에러남')
    console.log(e) // e: 에러메세지 출력해줌
   }
*/
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
//댓글 가져오는 기능 구현
    let result2 = await db.collection('comment').find({parentId : new ObjectId(req.params.id)}).toArray()
    let result = await db.collection('post').findOne({ _id : new ObjectId(req.params.id)})
    res.render('detail.ejs',{result : result, result2 : result2})
    console.log(req.params.id) //유저가 글번호를 입력하면 params.id에 저장됨

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
    let result = await db.collection('post').deleteOne({
_id : new ObjectId(req.query.docid),
      username :new ObjectId(req.user._id)
    })
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
    if (await bcrypt.compare(입력한비번, result.password)) {
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


// //제출한 아이디 비번이 DB에 있는지 확인하고 있으면 세션 만들어줌
//   app.post('/login', async (req, res, next) => {
//  //error : 에러시 뭐 들어옴, user : 성공시 뭐 들어옴 info : 실패시 이유
//     passport.authenticate('local',(error, user, info)=>{
//         if (error) return res.status(500).json(error)
//         if (!user) return res.status(401).json(info.message)
//         req.logIn(user, (err)=> {
//         if(err) return next(err)
//         res.redirect('/list')  // 로그인 완료시 실행할 코드
//     })
//     })(req, res, next)

// }) 

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
  res.redirect('/list')

})

app.get('/mypage',(req,res)=>{
  res.render('mypage.ejs')
})


//4.다음과 같이 사용이 가능함
app.use('/shop', require('./routes/shop.js')) 


app.use('/board',require('./routes/board.js'))

app.get('/search',async(req,res)=>{
let 검색조건 = [
  {$search : {
    index : 'title_index',
    text : { query : req.query.val, path : 'title' }
  }},
  //결과 정렬은 $sort: {필드 : 1}
  {$sort : {날짜 : 1} },
  //결과 수 제한은 $limit : 수량 , $skip : 수량 은 스킵
  //$project 필드 숨기기

]

  //검색할 땐 .find 보다는 .aggregate()
  let result = await db.collection('post').aggregate(검색조건).toArray() //find 속 조건에 해당하는 데이터 전부 가져와라
  res.render('search.ejs',{posts : result})
})

app.post('/comment',async(req,res)=>{
  let result = await db.collection('comment').insertOne({
    content : req.body.content,
    writerId: new ObjectId(req.user._id),
    writer : req.user.username,
    ParentId : new ObjectId (req.body.parentId)
  })
  res.redirect('back')
})

// 채팅방 가져오는 API
app.get('/chat/request', async(req, res)=>{
  await db.collection('chatroom').insertOne({
  member : [req.user._id, new ObjectId(req.query.writerId)],
  date : new Date()
  })
  res.redirect('/chat/list')
})
 
// 채팅방 목록보여주는 API
app.get('/chat/list',async(req,res)=>{
  let result = await db.collection('chatroom').find({member : req.user._id}).toArray() //내가 속한 채팅방들을 DB에서 꺼내서 여기 박아야함
  res.render('chatList.ejs', {result : result})
  console.log("chat/list의 result입니다.",result)
})

// 채팅방 목록보여주는 API
app.get('/chat/detail/:id',async(req,res)=>{
let result = await db.collection('chatroom').findOne({ _id : new ObjectId(req.params.id) })
res.render('chatDetail.ejs', {result : result})
console.log("chat/detail의 result입니다.",result)
})
 
//유저가 웹소켓 연결시 서버에서 코드실행하려면
 io.on('connection',(socket)=>{
  console.log("어떤놈이 웹소켓 연결함")
  //데이터 수신하려면 socket.on()
  socket.on('age',(data)=>{
    console.log('유저가 보낸거',data)
    io.emit('name','kim')
  })
//[서버 -> 모든유저]데이터 전송은
  // io.emit('데이터이름','데이터')
  //웹소켓은 room 기능있음
  //유저들 들어갈 수 있는 웹소켓 방
  //-한 유저는 여러 room에 들어갈 수 있음
  //-[서버 -> room에 속한 유저] 메세지 전송가능

  //유저를 room으로 보내려면 socket.join(룸이름)
  socket.on('ask-join',(data)=>{ //chatDetail에서 날라온 정보를 
  //socket.request.session //로그인된 유저정보
  socket.join(data)
  })
//Q유저가 특정 룸에 메세지 보내려면?
// 1. 서버에게 룸에 메세지 전달하라고 부탁
// 2. 서버는 부탁받으면 룸에 뿌림

//2. 서버는 메세지 수신시 룸에 전달
  socket.on('message-send',(data)=>{
    //실제 서비스는 socket.io + DB adapter 쓰는게 좋음 //메모리가 아닌 db에 저장함
    //db에 채팅내용을 저장하는 코드작성 저장요소 (채팅내용, 날짜,부모document, 작성자)
    //dbcollection~~
  io.to(data.room).emit('message-broadcast',data.msg)
  })

 }) 

 //SSE 구현
 app.get('/stream/list',(req,res)=>{
  res.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  //1초마다 데이터 전송
  // setInterval(()=>{
  // res.write('event: msg\n');
  // res.write('data: 바보\n\n');
  // }, 1000)

  //insert 되는 경우에만 감지


  //change stream 사용법
  changeStream.on('change',(result)=>{ 
    console.log(result.fullDocument) //2. 변동사항 발생시 여기가 실행됨
    res.write('event: msg\n')
    res.write(`data: ${JSON.stringify(result.fullDocument)}\n\n}`)
  })

})