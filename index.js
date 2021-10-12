const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const registration_numbers = require('./registration_numbers');
const Routes = require('./routes/registrations')


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
regRoutes = Routes(regNum)

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


app.get('/', regRoutes.homePage);
app.post('/reg_numbers', regRoutes.addRegistration);
app.post('/regTown', regRoutes.selectTown);
app.post("/displayAll", regRoutes.showAll);
app.get('/clearbtn', regRoutes.clear);

let PORT = process.env.PORT || 3008;
app.listen(PORT, function () {
    console.log("app started", PORT)
});