const formatInvoiceMail = (payload, transactionDay, totalAmount, quantity) => {
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
  This is a notice that an invoice has been generated for you by Ophylo Tech. Nig on ${transactionDay}. Your payment method is 
    <span
      style="
        font-family: Poppins;
        font-style: normal;
        font-weight: 300;
        font-size: 20px;
        line-height: 26px;
        color: #000;
      "
      >WALLET.</span
    >
      <br />
    </div>
  </div>
  <hr style="text-align: start; margin-top: 20px; margin-bottom: 20px; "/>
  <div style="
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 20px;
  font-family: Poppins;
">

   <div style="
   font-style: normal;
   font-weight: 500;
   font-size: 20px;
   line-height: 35px;
  font-family: Poppins;
   color: #686868;
   ">Invoice Items</div>
   <div
   style="
    font-size: 18px;
   " >Invoice Number: <span style="
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
   font-family: Poppins;
    line-height: 35px;
    color: #686868;
    ">${payload.id}</span></div>
   <div 
   style="
    font-size: 18px;
   " >Quantity: <span style="
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 35px;
    color: #686868;
  font-family: Poppins;
    ">${payload.quantity}</span></div>
   <div 
   style="
    font-size: 18px;
   " >Amount Due: <span style="
    font-style: normal;
   font-family: Poppins;
    font-weight: 500;
    font-size: 20px;
    line-height: 35px;
    color: #686868;
    ">NGN${payload.totalAmount}</span></div>


  </div>
  <hr style="text-align: start; margin-top: 20px; margin-bottom: 20px; "/>
  <div style="
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
  padding-bottom: 20px;
  font-family: Poppins;
">

  
  
   <div style="
    font-size: 18px;
   " >VAT(Insert VAT%): <span style="
    font-style: normal;
    font-weight: 500;
    font-size: 20px;
    line-height: 35px;
    color: #686868;
  font-family: Poppins;
    ">${payload.vat}%</span></div>
   <div 
   style="
    font-size: 18px;
   " >Initial Deposit: <span style="
    font-style: normal;
   font-family: Poppins;
    font-weight: 500;
    font-size: 20px;
    line-height: 35px;
    color: #686868;
    ">NGN${payload.amount}</span></div>
  


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
        font-family: Poppins;
        font-style: normal;
        font-weight: 500;
        font-size: 14px;
        line-height: 18px;
        color: #686868;
      "
      >PREVIEW HERE:</span
    >
    <div>
      <a
        href="https://linx-testing.netlify.app/"
        style="
          font-family: Poppins;
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
