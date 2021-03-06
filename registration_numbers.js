module.exports = function registration_numbers(pool) {
    var reg = ""
    var errorMsg = ""
    async function setReg(regN) {
        try {
            errorMsg = ""
            var regs = regN.registration_Num

            reg = regs.toUpperCase()
            var regex = /^((CA|CY|CL)\s\d{3}\s\d{3})$|^((CA|CY|CL)\s\d{3}\-\d{3})$/
            var regexTest = regex.test(reg)
            var regLetters = reg.slice(0, 2);

            var str = await pool.query(`select town_id from towns where reg_string = $1`, [regLetters]).rows
            const isRegExsist = await pool.query(`select registration_num from registrationnumbers where registration_num = $1`, [reg]);
            var townId = await getIdTown(regLetters);
            if (reg !== '') {
                if (regexTest === true) {
                    if (isRegExsist.rowCount === 0) {
                        await pool.query(`insert into registrationnumbers (registration_num, town_id)  
                values ($1,$2)`, [reg, townId]);
                    }
                    else {
                        errorMsg = 'Registration number already exists'
                    }

                }
                else {
                    errorMsg = 'Please follow  the format shown on the screen'
                }
            }
            else {
                errorMsg = "Please enter a registration number"
            }

            return str;

        } catch (error) {
            console.log(error)
        }
    }
    async function getIdTown(id) {
        try {
            var townId = await pool.query(`select town_id from towns where reg_string = $1`, [id])
            return townId.rows[0].town_id;

        } catch (error) {
            console.log(error)
        }

    }
    async function getReglist() {
        try {
            const data = await pool.query(`select * from registrationNumbers`);
            return data.rows

        } catch (error) {
            console.log(error)
        }

    }

    async function selectedTown(regString) {
        try {
            var string = await getIdTown(regString)
            const data = await pool.query(`select registration_num from registrationnumbers where town_id = $1 `, [string])
            return data.rows

        }
        catch (error) {
            console.log(error)
        }
    }

    function getError() {
        return errorMsg
    }

    async function reset() {
        try {
            const clear = await pool.query(`delete from registrationNumbers`)
            return clear.rows
        } catch (error) {
            console.log(error)
        }

    }
    return {
        setReg,
        getReglist,
        reset,
        getIdTown,
        selectedTown,
        getError

    }

}
