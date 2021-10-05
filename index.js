const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const registration_numbers = require('./registration_numbers');
// const Routes = require('./routes/registrations')


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
// regRoutes = Routes(regNUm)

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


app.get('/', async function (req, res) {
    list = await regNum.getReglist()
    res.render('index', {
        list,
        reg,
    })
});

app.post('/reg_numbers', async function (req, res) {
    try {
        var regNumber = req.body.reg
        var capitalise = regNumber.toUpperCase()
        list = await regNum.getReglist()
            if (regNumber !=="") {
                if(regex.test(capitalise)){
                    reg = await regNum.setReg({
                        registration_Num: capitalise
                    })
            //            if(list === capitalise){
            //     req.flash('error', "Registration already exists") 

            //  }
                }
             
                else{
                    req.flash('error', 'Please follow  the format shown on the screen') 
                }
          
        //         else{
        //             reg = await regNum.setReg({
        //                 registration_Num: regNumber
        //             })
                     
        // res.redirect('/');
        //         }
              
            }
            else{
                req.flash('error', 'Please enter a registration number')
            }
          
          
        //    else if (list.length!==0){
        //         if(list[0].registration_num === regNumber) {
        //             console.log("hi")
        //               req.flash('error', 'The registration number already exist') 
        //               res.redirect('/')
        //                }

        //     }
        //     else 


        // else if (list.length!==0) {

        //     if (list.includes(capitalise)===false){
        //         console.log(regex.test(capitalise));
        //         if(regex.test(capitalise)){
        //             // if (list[0].registration_num === capitalise) {
        //             //     req.flash('error', 'The registration number already exist')   
        //             // }
        //             //else{
        //                 reg = await regNum.setReg({
        //                     registration_Num: capitalise
        //                    })

        //            // }
        //             console.log("regex test");



        //         }
        //          else{
        //             req.flash('error', 'Please follow format') 
        //          }
        //     }


        //  }

        //    else 

        // else{
        //     req.flash('error', 'Please follow format') 
        //     res.redirect('/')
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

        // if (regNumber !== "") {

        //     if (list.length === 0) {
        //         for (let x = 0; x < list.length; x++) {
        //             const regNumbers = list[x];
        //             console.log(list[x]);
        //             if (regNumbers.registration_num !== regNumber) {
        //                 console.log('not found');
        //                 if (regex.test(capitalise)) {

        //                 } else {
        //                     req.flash('error', 'Please follow format')
        //                 }
        //             } else {
        //                 req.flash('error', 'The registration number already exist')
        //             }
        //         }
        //     }
        // } else {
        //     req.flash('error', regNum.getError())
        
           
        
           

            // req.flash('error', regNum.getError())
        
        res.redirect('/');

        // res.render('index')

    } catch (error) {
        console.log(error)
    }


});
app.post('/regTown', async function (req, res) {
    var regs = req.body.registration


    if (regs === undefined) {
        req.flash('error', 'Please select a town first')

        res.render('index')
    }

    else {
        list = await regNum.selectedTown(regs)
        if (list.length === 0) {
            req.flash('error', 'There are no registration numbers for this selected town')
        }
        res.render('index', { list });

    }



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
    //res.redirect('/')
});
app.post("/displayAll", async function (req, res) {

    list = await regNum.getReglist()
    console.log(list);
    if (list.length === 0) {
        req.flash('error', 'There are no registration numbers at the moment')

    }
    res.redirect('/')
});

app.get('/clearbtn', async function (req, res) {
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