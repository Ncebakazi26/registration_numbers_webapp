module.exports = function regRoutes(regNum) {
    var reg = ""
    var list = []

    async function homePage(req, res) {
        list = await regNum.getReglist()
        res.render('index', {
            list,
            reg,
        });
    }

    async function addRegistration(req, res, next) {
        try {
            var regNumber = req.body.reg
            reg = await regNum.setReg({
                registration_Num: regNumber
            })
            req.flash('error', regNum.getError())
            res.redirect('/');
        } catch (error) {
            next(error);
        }


    }
    async function selectTown(req, res, next) {
        try {
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

        } catch (error) {
            next(error)
        }

    }

    async function showAll(req, res, next) {
        try {
            list = await regNum.getReglist()
            console.log(list);
            if (list.length === 0) {
                req.flash('error', 'There are no registration numbers at the moment')

            }
            res.redirect('/')
        }

        catch (error) {
            next(error)
        }

    }
    async function clear(req, res, next) {
        try {
            await regNum.reset()
            req.flash('info', 'The App has successfully reset')
            res.redirect('/')


        } catch (error) {
            next(error)
        }

    }

    return {
        homePage,
        addRegistration,
        selectTown,
        showAll,
        clear


    }
}