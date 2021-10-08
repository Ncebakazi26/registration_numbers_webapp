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
            regNum: "CA 123 123"
        });
        let regs = reg.getReglist()
        assert.equal(1, regs.length)
    });

    // it ('should add the registration numbers in the db and return the added registration numbers', async function(){
        // await reg.setReg({
        //     regNum:"CL 123 123"
        // })
        // assert.equal("CL 123 123",reg.getReglist)

    // });
    // it ('should add the registration numbers from Cape Town in the db and return the name Cape Town', async function(){
    //     await reg.setReg({
    //         regNum:"CA 543 213"
    //     })
    //     assert.equal("Cape Town",reg.selectedTown())

    // });

   // it ('should not add the registration numbers that has morethan 6 digits and return the error message', async function(){
    //     await reg.setReg({
    //         regNum:"CA 543 2137"
    //     })
    //     assert.equal("Please follow the format",reg.setReg())

    // });
    


    after(function(){
        pool.end();
    })

});