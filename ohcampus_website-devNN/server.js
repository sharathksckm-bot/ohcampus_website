const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/login',(req,res)=>{
    console.log(req.body);
    res.redirect('https://ohcampus.com/home')
});

app.listen(port,()=>{
    console.log(`Server listening at http://localhost:${port}`);
});