require("dotenv").config();
const express = require("express")
const path = require("path");
const cors = require("cors")
const fs = require("fs")
require('express-async-errors');
const cookieSession = require('cookie-session');
const { errorHandler, NotFoundError } = require('@bc_tickets/common');
const { businessRouter } = require('./routes/index');
const { Nigeria, Ghana, Kenya, businessCategory } = require("./utils/convertExcelToJson");



let filePath = "business/public/states_and_lga.xlsx";
let filePath1 = "business/public/biz.xlsx";
async function convertScript() {
    try {
        // let ghana = await Ghana(filePath);
        // let kenya = await Kenya(filePath);
        // let nigeria = await Nigeria(filePath1)
        //     // console.log(res)


        // let all = {
        //     counties: [...nigeria.countries, ...ghana.countries, ...kenya.countries],
        //     states: [...nigeria.states, ...ghana.states, ...kenya.states],
        //     lgas: [...nigeria.lgas, ...ghana.lgas, ...kenya.lgas]

        // }
        let bizCat = await businessCategory(filePath1)
        fs.writeFile('business/public/business_category_and_sub.json', JSON.stringify(bizCat), 'utf8', (err) => {
            if (err) {
                console.log(err)
            }
        });
        return bizCat

    } catch (error) {
        console.log(error)

    }


}
//convertScript()




const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")));

app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV != 'test',
    })
);

app.get("/", (req, res) => {
    res.send("testing business endpoint")
})
app.use(businessRouter);
app.all('*', async() => {
    throw new NotFoundError();
});

app.use(errorHandler);

module.exports = { app };