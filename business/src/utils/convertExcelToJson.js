const excelToJson = require("convert-excel-to-json");
exports.convertExcelToJSON = async(filePath) => {
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
            let stateTemplate = { id: datum.state_id, countryName: "Nigeria", state: datum.state_name }
            let lgaTemplate = { id: datum.lga_id, countryName: "Nigeria", state: datum.state_name, lga: datum.lga_name }
            states.push(stateTemplate);
            lgas.push(lgaTemplate)
        }



        return {
            states,
            lgas
        };
    } catch (error) {
        console.log(error);
    }
};