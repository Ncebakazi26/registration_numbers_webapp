const assert = require('assert');
const registration_numbers = require('../registration_numbers');
const pg = require("pg");
const Pool = pg.Pool;

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/registration_numbers1_test';

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
            registration_Num: 'CA 123 123'
        });
        let regs = await reg.getReglist()
        assert.equal(1, regs.length)
    });
    it('should add the registration numbers in the db and return 3', async function () {
        await reg.setReg({
            registration_Num: 'CA 123 123'
        });
        await reg.setReg({
            registration_Num: 'CY 123 153'
        });
        await reg.setReg({
            registration_Num: 'CL 273 123'
        });
        let regs = await reg.getReglist()
        assert.equal(3, regs.length)
    });
    it('should not add the same registration number in the db and must return 3 for the length', async function () {
        await reg.setReg({
            registration_Num: 'CA 123 123'
        });
        await reg.setReg({
            registration_Num: 'CY 123 153'
        });
        await reg.setReg({
            registration_Num: 'CL 273 123'
        });
        await reg.setReg({
            registration_Num: 'CL 273 123'
        });
        let regs = await reg.getReglist()
        assert.equal(3, regs.length)
    });

    it('should return 1 for the registration number that belongs to Cape Town', async function () {

        assert.equal(1, await reg.getIdTown('CA'))

    });
    it('should return 2 for the registration number that belongs to Bellville', async function () {
        assert.equal(2, await reg.getIdTown('CY'))

    });
    it('should return 3 for the registration number that belongs to Paarl', async function () {
        assert.equal(3, await reg.getIdTown('CL'))

    });
    it('should display registration numbers for Cape Town if its the seclected town  ', async function () {
        await reg.setReg({
            registration_Num: "CL 854 955"
        })
        await reg.setReg({
            registration_Num: "CL 369 955"
        })
        await reg.setReg({
            registration_Num: "CA 854 955"
        })

        assert.deepEqual([{ registration_num: "CA 854 955" }], await reg.selectedTown("CA"))

    });
    it('should display registration numbers for Bellville if its the seclected town  ', async function () {
        await reg.setReg({
            registration_Num: "CL 854 955"
        })
        await reg.setReg({
            registration_Num: "CY 369 876"
        })
        await reg.setReg({
            registration_Num: "CY 123 955"
        })

        assert.deepEqual([{ registration_num: "CY 369 876" }, { registration_num: "CY 123 955" }], await reg.selectedTown("CY"))

    });
    it('should return an error saying follow the format if the digits for the registration number are morethan 6', async function () {
        await reg.setReg({
            registration_Num: "CL 123 5647"
        })

        assert.equal('Please follow  the format shown on the screen', await reg.getError())

    });
    it('should display the error message when the same registration number is entered ', async function () {
        await reg.setReg({
            registration_Num: "CL 123 564"
        })
        await reg.setReg({
            registration_Num: "CL 123 564"
        })

        assert.equal('Registration number already exists', await reg.getError())

    });
    it('should delete the registration number that exist in the database', async function () {
        await reg.getReglist("CL 123 564")

        assert.equal("", await reg.reset())

    });
    after(function () {
        pool.end();
    })

});