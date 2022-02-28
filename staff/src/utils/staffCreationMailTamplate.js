exports.staffCreationMail = async(options) => {
    let date = new Date()
    let day = date.getDate()
    let month = date.toLocaleString('default', { month: 'short' })
    let year = date.getFullYear()
    let htmlTmaplate = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Linx Staff Creation</title>
      </head>
      <style>
        @font-face {
          font-family: SteradianBlack;
          src: url(${process.env.BASE_URL}fonts/steradian/Steradian\ Black.otf);
        }
        @font-face {
          font-family: SteradianBold;
          src: url(${process.env.BASE_URL}fonts/steradian/Steradian\ Bold.otf);
        }
        @font-face {
          font-family: Steradian;
          src: url(${process.env.BASE_URL}fonts/steradian/Steradian\ Regular.otf);
        }
      </style>
      <body style="padding-left: 30px; padding-top: 20px; padding-right: 30px">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-direction: row;
            border-bottom: 1px solid rgba(1, 87, 255, 0.7);
            transform: rotate(-0.18deg);
            padding-bottom: 20px;
          "
        >
          <div
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: normal;
              font-size: 16px;
              line-height: 21px;
              color: #000000;
            "
          >
          ${day}-${month}-${year}
            05-Feb-2022
          </div>
          <div><img src="${process.env.BASE_URL}images/Group.svg" /></div>
        </div>
        <div
          style="
            padding-top: 40px;
            font-family: Steradian;
            font-size: 20px;
            line-height: 26px;
            margin-bottom: 40px;
            color: #686868;
          "
        >
          Dear
          <span
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: 300;
              font-size: 20px;
              line-height: 26px;
              color: #000;
            "
            >${options.firstName} ${options.lastName},</span
          >
        </div>
        <div
          style="
            font-family: Steradian;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 26px;
            color: #686868;
          "
        >
          Your staff profile as a
          <span
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: 300;
              font-size: 20px;
              line-height: 26px;
              color: #000;
            "
            >${options.employmentType}</span
          >
          employee and a
          <span
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: 300;
              font-size: 20px;
              line-height: 26px;
              color: #000;
            "
            >${options.roleName}</span
          >
          role at ${options.businessTradingName} has been successfully created on LinX.
    
          <div style="margin-top: 40px">
            Please use the following details to log into the platform:<br />
            Company Alias:
            <span
              style="
                font-family: Steradian;
                font-style: normal;
                font-weight: 300;
                font-size: 20px;
                line-height: 26px;
                color: #000;
              "
            >
            ${options.businessAlias}</span
            >
            <br />
            Password:
            <span
              style="
                font-family: Steradian;
                font-style: normal;
                font-weight: 300;
                font-size: 20px;
                line-height: 26px;
                color: #000;
              "
              >${options.password}</span
            >
            <br />
            StaffId:
            <span
              style="
                font-family: Steradian;
                font-style: normal;
                font-weight: 300;
                font-size: 20px;
                line-height: 26px;
                color: #000;
              "
              >${options.staffId}</span
            >
            <br />
            Click the link below to open the LinX app, change your password and
            login to your user dashboard.
          </div>
        </div>
        <div
          style="
            margin-top: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          "
        >
          <span
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: 500;
              font-size: 14px;
              line-height: 18px;
              color: #686868;
            "
            >OPEN HERE:</span
          >
          <div>
            <a
              href="https://linx-testing.netlify.app/"
              style="
                font-family: Steradian;
                font-style: normal;
                font-weight: normal;
                font-size: 14px;
                line-height: 18px;
                text-decoration-line: underline;
    
                color: rgba(1, 87, 255, 0.65);
              "
              >LinX</a
            >
          </div>
        </div>
    
        <div
          style="
            margin-top: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          "
        >
          <div>
            <span
              style="
                font-family: Steradian;
                font-style: normal;
                font-weight: normal;
                font-size: 16px;
                line-height: 35px;
                color: #000000;
              "
              >Powered by
            </span>
            <img src="${process.env.BASE_URL}images/Group.svg" alt="" />
          </div>
          <div
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: normal;
              font-size: 10px;
              line-height: 35px;
              text-align: center;
              color: #000000;
            "
          >
            No 50B, Tapa street, Yaba, Lagos, Nigeria
          </div>
          <div
            style="
              font-family: Steradian;
              font-style: normal;
              font-weight: normal;
              font-size: 10px;
              line-height: 35px;
              text-align: center;
              color: #000000;
            "
          >
            Phone number: +2348176638932
          </div>
        </div>
      </body>
    </html>
    `
    return htmlTmaplate
}