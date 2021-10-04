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
var regex = /^((CA|CY|CL)\s\d{3}\s\d{3})$|^((CA|CY|CL)\s\d{3}\-\d{3})$/


app.get('/',async function(req,res){
    list = await regNum.getReglist()
    var messages = req.flash('error')
    //console.log(messages[0])
    var error = regNum.getError()
    console.log(error)
    res.render('index',{
        list,
        reg,
        messages
    })
});

app.post('/reg_numbers',async function(req,res){
    try {
        var regNumber = req.body.reg
      
        if (regNumber === "") {
            req.flash('error', 'Please enter a registration number')
        }
        if(regNumber){
            reg = await regNum.setReg({
                registration_Num: regNumber
               })

        }
        // else{
        //     req.flash('error', 'Please select a town')
        // }
        // if(list.length!==0){
        //     if(list[0].registration_num === regNumber) {
        //         req.flash('error', 'The registration number already exist') 
        //     }
        // }
        // if (list.includes(regNumber)===false){
            // if(regex.test(regNumber)){
           

            // }

        // else if(!regex.test(regNumber)){
        //     req.flash('error', 'Please follow format') 
        // } 
      
       res.redirect('/');
    } catch (error) {
        console.log(error)
    }
  
   
});
app.post('/regTown',async function (req, res){
   var errors = ""
   req.flash('error', 'Please select a town')  
    var regs = req.body.registration
    console.log(regs)
    if (regs === undefined){
    // errors = "Please select a town"
    //      console.log("hello")
        
   
        
        //res.redirect('/')
    }

    if(regs){
        list = await regNum.selectedTown(regs)

        res.render('index',{list});

    }
 regNum.setError(errors)

   
    // if(allReg){
      
        // res.render('index',{list});
       
    // }
    // if(!allReg) {
    //     req.flash('error', 'There are no registrations at the moment')
    // }
    // else{
    //     req.flash('error', 'There are no registration numbers for this selected town')  
    // }
    //   else{
       
    

    //   }
      res.redirect('/')
});
app.post("/displayAll", async function(req,res){
    
    list= await regNum.getReglist()
    if(!list){
         req.flash('error', 'There are no registrations at the moment')
       
    }
    else{ 
        res.redirect('/')

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