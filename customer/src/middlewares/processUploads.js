  exports.processCompanyLogo = async (req, res, next) => {
    if (!req.file) return next();
  
    // company logo
    req.body.companyLogo = req.file.path;
  
    next();
  };
  
  