const crypto = require("crypto");

const order_id = "order_SVRwobAOuGyXFK";
const payment_id = "pay_123456"; 

const body = `${order_id}|${payment_id}`;

const signature = crypto
  .createHmac("sha256", "vETco919VC8VMxtlDT7R8DH7") 
  .update(body)
  .digest("hex");

console.log(signature);