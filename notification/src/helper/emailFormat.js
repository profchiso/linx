const formatStaffWalletCreationMail = (payload) => {
  return `
  <head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Linx Mail Template</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet">
</head>

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
        font-family: Poppins;
        font-style: normal;
        font-weight: normal;
        font-size: 16px;
        line-height: 21px;
        color: #000000;
      "
    >
      05-Feb-2022
    </div>
    <div><img src="${process.env.BASE_URL}/images/Group.svg" /></div>
  </div>
  <div
    style="
      padding-top: 40px;
      font-family: P;
      font-size: 20px;
      line-height: 26px;
      margin-bottom: 40px;
      color: #686868;
    "
  >
    Dear
    <span
      style="
        font-family: P;
        font-style: normal;
        font-weight: 300;
        font-size: 20px;
        line-height: 26px;
        color: #000;
      "
      >${payload.name},</span
    >
  </div>
  <div
    style="
      font-family: P;
      font-style: normal;
      font-weight: normal;
      font-size: 20px;
      line-height: 26px;
      color: #686868;
    "
  >
    Your LinX wallet has been successfully created! This wallet enables you to
    perform some financial transactions on the LinX platform. Your LinX wallet
    ID is
    <span
      style="
        font-family: P;
        font-style: normal;
        font-weight: 300;
        font-size: 20px;
        line-height: 26px;
        color: #000;
      "
      >${payload.walletId}.</span
    >
   
      <br />
      <div style="margin-top: 50px;">Please click the link below to open the LinX app and login to access your wallet.</div>
      
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
        font-family: P;
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
          font-family: P;
          font-style: normal;
          font-weight: normal;
          font-size: 14px;
          line-height: 18px;
          color: rgba(1, 87, 255, 0.65);
          text-decoration: none;
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
          font-family: P;
          font-style: normal;
          font-weight: normal;
          font-size: 16px;
          line-height: 35px;
          color: #000000;
        "
        >Powered by
      </span>
      <img src="${process.env.BASE_URL}/images/Group.svg" alt="" />
    </div>
    <div
      style="
        font-family: P;
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
        font-family: P;
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
`;
};

const formatWalletDebitTransactionMail = (
  payload,
  amount,
  description,
  todaysDate
) => {
  return `
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Linx Mail Template</title>
  </head>

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
          font-family: Poppins;
          font-style: normal;
          font-weight: normal;
          font-size: 16px;
          line-height: 21px;
          color: #000000;
        "
      >
        05-Feb-2022
      </div>
      <div><img src="${process.env.BASE_URL}/images/Group.svg" /></div>
    </div>
    <div
      style="
        padding-top: 40px;
        font-family: Poppins;
        font-size: 20px;
        line-height: 26px;
        margin-bottom: 40px;
        color: #686868;
      "
    >
      Dear
      <span
        style="
          font-family: Poppins;
          font-style: normal;
          font-weight: 300;
          font-size: 20px;
          line-height: 26px;
          color: #000;
        "
        >${payload.name},</span
      >
    </div>
    <div
      style="
        font-family: Poppins;
        font-style: normal;
        font-weight: normal;
        font-size: 20px;
        line-height: 26px;
        color: #686868;
      "
    >
      Your LinX Wallet has been debited
      <span
        style="
          font-family: Poppins;
          font-style: normal;
          font-weight: normal;
          font-size: 20px;
          line-height: 26px;
          color: #000;
        "
        >NGN${amount}</span
      >
    </div>
    <div
      style="
        font-family: Poppins;
        font-style: normal;
        font-weight: normal;
        font-size: 20px;
        line-height: 35px;
        color: #686868;
        margin-top: 60px;
      "
    >
      Your LinX Wallet Transaction Summary
    </div>
    <div
      style="
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        width: 100%;
        margin-top: 20px;
      "
    >
      <div style="background-color: #e4e1e1; width: 199px">
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Account Name
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Account Number
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Description
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Transaction ID
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Wallet ID
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Transaction Date
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Available Balance
        </div>
      </div>
      <div
        style="
          background-color: #e4e1e1;
          width: 199px;
          margin-left: 10px;
          width: 319px;
        "
      >
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ${payload.name}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          405******63
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ${description}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          1909826458729
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ********${payload.walletId.substring(8)}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ${todaysDate}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          NGN${payload.balance}
        </div>
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
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 16px;
            line-height: 35px;
            color: #000000;
          "
          >Powered by
        </span>
        <img src="${process.env.BASE_URL}/images/Group.svg" alt="" />
      </div>
      <div
        style="
          font-family: Poppins;
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
          font-family: Poppins;
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
  `;
};

const formatWalletCreditTransactionMail = (
  payload,
  amount,
  description,
  todaysDate
) => {
  return `
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Linx Mail Template</title>
  </head>

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
          font-family: Poppins;
          font-style: normal;
          font-weight: normal;
          font-size: 16px;
          line-height: 21px;
          color: #000000;
        "
      >
        05-Feb-2022
      </div>
      <div><img src="${process.env.BASE_URL}/images/Group.svg" /></div>
    </div>
    <div
      style="
        padding-top: 40px;
        font-family: Poppins;
        font-size: 20px;
        line-height: 26px;
        margin-bottom: 40px;
        color: #686868;
      "
    >
      Dear
      <span
        style="
          font-family: Poppins;
          font-style: normal;
          font-weight: 300;
          font-size: 20px;
          line-height: 26px;
          color: #000;
        "
        >${payload.name},</span
      >
    </div>
    <div
      style="
        font-family: Poppins;
        font-style: normal;
        font-weight: normal;
        font-size: 20px;
        line-height: 26px;
        color: #686868;
      "
    >
      Your LinX Wallet has been credited
      <span
        style="
          font-family: Poppins;
          font-style: normal;
          font-weight: normal;
          font-size: 20px;
          line-height: 26px;
          color: #000;
        "
        >NGN${amount}</span
      >
    </div>
    <div
      style="
        font-family: Poppins;
        font-style: normal;
        font-weight: normal;
        font-size: 20px;
        line-height: 35px;
        color: #686868;
        margin-top: 60px;
      "
    >
      Your LinX Wallet Transaction Summary
    </div>
    <div
      style="
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        width: 100%;
        margin-top: 20px;
      "
    >
      <div style="background-color: #e4e1e1; width: 199px">
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Account Name
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Account Number
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Description
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Transaction ID
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Wallet ID
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Transaction Date
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #686868;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          Available Balance
        </div>
      </div>
      <div
        style="
          background-color: #e4e1e1;
          width: 199px;
          margin-left: 10px;
          width: 319px;
        "
      >
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ${payload.name}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          405******63
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ${description}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          1909826458729
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ********${payload.walletId.substring(8)}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          ${todaysDate}
        </div>
        <div
          style="
            padding-bottom: 10px;
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 20px;
            line-height: 35px;
            color: #000000;
            padding-left: 10px;
            margin-top: 10px;
            border-bottom: 1px solid #b8b2b2;
          "
        >
          NGN${payload.balance}
        </div>
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
            font-family: Poppins;
            font-style: normal;
            font-weight: normal;
            font-size: 16px;
            line-height: 35px;
            color: #000000;
          "
          >Powered by
        </span>
        <img src="${process.env.BASE_URL}/images/Group.svg" alt="" />
      </div>
      <div
        style="
          font-family: Poppins;
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
          font-family: Poppins;
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
  `;
};

module.exports = {
  formatStaffWalletCreationMail,
  formatWalletDebitTransactionMail,
  formatWalletCreditTransactionMail,
};
