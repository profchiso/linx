const fs = require("fs")
const excelToJson = require("convert-excel-to-json");
exports.Nigeria = async(filePath) => {
    try {
        let countries = []
        let states = [];
        let lgas = []
        const result = excelToJson({
            sourceFile: filePath,
            header: {
                // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                rows: 1, // 2, 3, 4, etc.
            },
            sheets: ["Sheet1"],
            columnToKey: {
                A: "state_id",
                B: "state_name",
                C: "lga_id",
                D: "lga_name",
            },
        });
        console.log(result);

        for (let datum of result.Sheet1) {
            if (!countries.includes("Nigeria")) {
                countries.push("Nigeria")
            }
            let stateTemplate = { id: "Nigeria", countryName: "Nigeria", state: datum.state_name }
            let lgaTemplate = { id: "Nigeria", countryName: "Nigeria", state: datum.state_name, lga: datum.lga_name }


            states.push(stateTemplate);
            lgas.push(lgaTemplate)
        }


        const key = 'state';

        const arrayUniqueByKey = [...new Map(states.map(item => [item[key], item])).values()];

        console.log(arrayUniqueByKey.length)
        let converted = {
            countries,
            states: arrayUniqueByKey,
            lgas
        };
        // fs.writeFile('business/public/nigeria.json', JSON.stringify(converted), 'utf8', (err) => {
        //     if (err) {
        //         console.log(err)
        //     }
        // });

        return converted
    } catch (error) {
        console.log(error);
    }
};

exports.Ghana = (filePath) => {
    try {
        let countries = []
        let states = [];
        let lgas = []
        const result = excelToJson({
            sourceFile: filePath,
            header: {
                // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                rows: 1, // 2, 3, 4, etc.
            },
            sheets: ["GHANA"],
            columnToKey: {
                A: "state",
                B: "lga",

            },
        });


        for (let datum of result.GHANA) {
            if (!countries.includes("Ghana")) {
                countries.push("Ghana")
            }
            let stateTemplate = { id: "Ghana", countryName: "Ghana", state: datum.state }
            let lgaTemplate = { id: "Ghana", countryName: "Ghana", state: datum.state, lga: datum.lga }
            states.push(stateTemplate);
            lgas.push(lgaTemplate)
        }


        const key = 'state';

        const arrayUniqueByKey = [...new Map(states.map(item => [item[key], item])).values()];

        let converted = {
            countries,
            states: arrayUniqueByKey,
            lgas
        };
        // fs.writeFile('business/public/ghana.json', JSON.stringify(converted), 'utf8', (err) => {
        //     if (err) {
        //         console.log(err)
        //     }
        // });

        return converted

    } catch (error) {
        console.log(error)

    }
}

exports.Kenya = (filePath) => {
    try {
        let all = []
        let countries = []
        let states = [];
        let lgas = []
        const result = excelToJson({
            sourceFile: filePath,
            header: {
                // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                rows: 1, // 2, 3, 4, etc.
            },
            sheets: ["KENYA"],
            columnToKey: {
                A: "id",
                B: "provinces",
                C: "counties",
                D: "subcounties"

            },
        });


        for (let datum of result.KENYA) {
            if (!countries.includes("Kenya")) {
                countries.push("Kenya")
            }
            all.push([{ state: datum.counties, lga: datum.subcounties.split(",") }])
        }
        let flat = all.flat()

        for (let f of flat) {
            let stateTemplate = { id: "Kenya", countryName: "Kenya", state: f.state }
            for (let i of f.lga) {
                let lgaTemplate = { id: "Kenya", countryName: "Kenya", state: f.state, lga: i }
                lgas.push(lgaTemplate)
            }

            states.push(stateTemplate);

        }


        lgas.shift()
        const key = 'state';

        const arrayUniqueByKey = [...new Map(states.map(item => [item[key], item])).values()];

        let converted = {
            countries,
            states: arrayUniqueByKey,
            lgas
        };

        // fs.writeFile('business/public/kenya.json', JSON.stringify(converted), 'utf8', (err) => {
        //     if (err) {
        //         console.log(err)
        //     }
        // });

        return converted

    } catch (error) {
        console.log(error)

    }
}

exports.businessCategory = (filePath) => {

    try {
        let businessCategory = []
        let subBusinessCategory = [];

        const result = excelToJson({
            sourceFile: filePath,
            header: {
                // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                rows: 1, // 2, 3, 4, etc.
            },
            sheets: ["cac_category"],
            columnToKey: {
                A: "nature",
                B: "business",
                C: "id",
                D: "sub",
                E: "isActive",
            },
        });
        console.log(result);

        for (let datum of result.cac_category) {

            let businessCategoryTemplate = { isActive: datum.isActive, businessCategory: datum.business }
            let subBusinessCategoryTemplate = { isActive: datum.isActive, businessCategory: datum.business, subBusinessCategory: datum.sub }


            businessCategory.push(businessCategoryTemplate);
            subBusinessCategory.push(subBusinessCategoryTemplate)
        }


        const key = 'businessCategory';

        const arrayUniqueByKey = [...new Map(businessCategory.map(item => [item[key], item])).values()];


        let converted = {

            businessCategory: arrayUniqueByKey,
            subBusinessCategory
        };
        // fs.writeFile('business/public/nigeria.json', JSON.stringify(converted), 'utf8', (err) => {
        //     if (err) {
        //         console.log(err)
        //     }
        // });

        return converted
    } catch (error) {
        console.log(error);
    }

}