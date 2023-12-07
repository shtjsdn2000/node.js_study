const express = require('express')
const app = express()

// app.listen : 내 컴퓨터 PORT하나 오픈하는 문법
app.listen(8080,() => {
    console.log('http://localhost:8080에서 서버 실행중')

})

// 8080port로 들어온 사람들에게 다음과 같은 내용을 보여줄것
app.get('/',(요청,응답)=>{
    응답.send('반갑다')
})