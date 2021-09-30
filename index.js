const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const registration_numbers = require('./registration_numbers');

const pg = require("pg");
const Pool = pg.Pool;
// should we use a SSL connection
let useSSL = false;

let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/registration_numbers1';


const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express()
const regNum = registration_numbers(pool)

const handlebarSetup = exphbs({
    partialsDir: "./views/partials",
    viewPath: './views',
    layoutsDir: './views/layouts'
});
// initialise session middleware - flash-express depends on it
app.use(session({
    secret: "Error messages",
    resave: false,
    saveUninitialized: true,
}));

// initialise the flash middleware
app.use(flash());
app.engine('handlebars', handlebarSetup);
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

var reg = ""
var list = []
app.get('/',async function(req,res){
    list = await regNum.getReglist()
    res.render('index',{
        list,
        reg,
        //regie
    })
});

app.post('/reg_numbers',async function(req,res){
    try {
        var regNumber = req.body.reg
        if (regNumber === "") {
            req.flash('error', 'Please enter a registration number')
        }
        reg = await regNum.setReg({
         registration_Num: regNumber
        })
        
       res.redirect('/');
    } catch (error) {
        console.log(error)
    }
  
   
});
app.post('/regTown',async function (req, res){
   
    var regs = req.body.registration
   
    var allReg = req.body.all
   
    if(allReg){
        await regNum.getReglist()
        // res.render('index',{list});
       res.redirect('/')
    }
    // if(!allReg){
    //     req.flash('error', 'There are no registrations at the moment')
    // }
    if(!regs == list){
        req.flash('error', 'There are no registration numbers for this selected town')  
    }
    else{
        list = await regNum.selectedTown(regs)
     res.render('index',{list});

    }
});
app.get('/clearbtn', async function(req,res){
    try {
        await regNum.reset() 
        res.redirect('/')
        
    } catch (error) {
        console.log(error)
    }
 
});

let PORT = process.env.PORT || 3008;
app.listen(PORT, function () {
    console.log("app started", PORT)
});