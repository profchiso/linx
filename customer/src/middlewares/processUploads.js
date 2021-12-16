  exports.processCompanyLogo = async(req, res, next) => {
      if (!req.file) return next();

      // company logo
      req.body.companyLogo = req.file.path;

      next();
  };

  exports.processBase64CompanyLogo = async(req, res, next) => {
      if (!req.body.companyLogo) return next();

      // company logo
      console.log(res)
      req.body.companyLogo = res.secure_url;

      next();
  };