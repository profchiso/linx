const { cloudinary } = require("../helper/upload")

exports.processCompanyLogo = async(req, res, next) => {
    if (!req.file) return next();

    // company logo
    req.body.companyLogo = req.file.path;

    next();
};

exports.processBase64CompanyLogo = async(req, res, next) => {
    if (!req.body.companyLogo) return next();



    await cloudinary.uploader.upload(
        req.body.companyLogo, {
            public_id: `companyLogo/${req.body.firstName.split(" ").join("-")}-companyLogo`,
        },
        (error, result) => {
            console.log(result)


            if (error) {
                console.log("Error uploading utilityBill to cloudinary");
            } else {
                req.body.companyLogo = result.secure_url;

            }

        }
    );

    next();
};