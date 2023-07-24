const express = require('express')
const app = express()
const path = require('path')

const PORT = process.env.PORT || 5000
const dotenv = require('dotenv')
dotenv.config()
const cors = require('cors')
const color = require('cli-colors')

const {notFound, errorHandler} = require('./middleware/errorMiddleware')
const getRouter = require('./routes/getRoute')
// const downloadRouter = require('./routes/downloadRoute')
require('ejs');

//set the view engine to EJS   
app.set('view engine', 'ejs')

//neccessary middleware
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))


app.use(cors({
    origin: ["http://localhost:5173", "https://file-sharing-app-frontend.vercel.app"]
}));
  

app.get("/", (req, res) => {
    res.send('server is running')
});

app.use('/file', getRouter)
// app.use('/file/download', downloadRouter)

//error middleware
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, (err)=>{
   err ? console.log(color.bgRed(err.message)) : 
   console.log(color.cyan(`listening on port ${PORT}`))
});
