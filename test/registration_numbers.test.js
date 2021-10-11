const assert = require('assert');
const registration_numbers = require('../registration_numbers');
const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/registration_numbers1';

const pool = new Pool({
    connectionString
});
describe('The regstration numbers web app', function () {
    let reg = registration_numbers(pool);
    beforeEach(async function () {
        await pool.query("delete from registrationnumbers");
    });
    it('should add the registration numbers in the db and return 1', async function () {
        await reg.setReg({
            registration_Num: "CA 123 123"
        });
        let regs =  await reg.getReglist()
        assert.equal(1, regs.length)
    });
    it ('should not add any other registration number that does not starts with CA,CY and CL in the db and return 0', async function(){
        await reg.setReg({
            registration_Num:"CJ 123 123"
        })
        let regs= await reg.getReglist()
        assert.equal(0,regs.length )

    });
   it ('should return 1 for the registration number that belongs to Cape Town', async function(){
        assert.equal(1, await reg.getIdTown("CA"))

    });
    it ('should return 2 for the registration number that belongs to Bellville', async function(){
        assert.equal(2, await reg.getIdTown("CY"))

    });
    it ('should return 3 for the registration number that belongs to Paarl', async function(){
        assert.equal(3, await reg.getIdTown("CL"))

    });
    it ('should display an error saying enter a registration number when there is no registration number entered', async function(){
        await reg.setReg({
            registration_Num:""
        })

        assert.equal("Please enter a registration number", await reg.getError())

     });
     it ('should return an error saying follow the format if the digits for the registration number are morethan 6', async function(){
        await reg.setReg({
            registration_Num:"CL 123 5647"
        })

        assert.equal('Please follow  the format shown on the screen', await reg.getError())

     });
     it ('should return ', async function(){
        await reg.setReg({
            registration_Num:"CL 123 564"
        })
        await reg.setReg({
            registration_Num:"CL 123 564"
        })

        assert.equal('Registration number already exists', await reg.getError())

     });
    after(function(){
        pool.end();
    })

});