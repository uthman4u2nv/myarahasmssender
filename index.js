const nodeCron = require("node-cron");
const winston = require('winston');
require('dotenv').config();
let fileName=new Date().getDay()+"-"+new Date().getMonth()+"-"+new  Date().getFullYear()+".log";
const logConfiguration = {
    
    'transports': [
        
        //new winston.transports.Console()
        new winston.transports.File({
            filename: 'logs/'+fileName
        })
    ],
    format: winston.format.combine(
        winston.format.label({
            label: `Label🏷️`
        }),
        winston.format.timestamp({
           format: 'MMM-DD-YYYY HH:mm:ss'
       }),
        winston.format.printf(info => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
    )
};
const logger = winston.createLogger(logConfiguration);
var axios = require('axios');

const smssendurl=process.env.SMSSendUrl;
const apikey=process.env.APIKey;

const job = nodeCron.schedule("15 * * * * *", async function jobYouNeedToExecute() {
  // Do whatever you want in here. Send email, Make  database backup or download data.
  await SendSMS("2348032518766","Testing the sms gateway")
  console.log(new Date().toLocaleString());
});

const SendSMS=async (phone,sms)=>{
    let body={
        "api_key":apikey,
        "to":phone,
        "from":"MyAraha",
        "sms":sms,
        "type":"plain",
        "channel":"dnd"
    }
    logger.info(JSON.stringify(body));
      try{
        var config = {
            method: 'POST',
            url:smssendurl,
            headers: { 
              'Content-Type': 'application/json',
            },
            data:body
          };
          axios(config)
      .then(async function (response) {
        //console.log(JSON.stringify(response.data));
        logger.info(response.data);
        logger.info(JSON.stringify(response.data.message));
        if(response.data.message){
            let resp={
                ResponseCode:"00",
                ResponseMessage:response.data.message,
                
            }
            console.log(resp)
        }else{
            let resp={
                ResponseCode:"69",
                ResponseMessage:response.data.message,
                
            }
            console.log(resp);
        }
      })
    }catch(err){
        logger.error(err.message);
        console.log(err.message)
    }finally{
        let resp={
            ResponseCode: "69",
            ResponseMessage:"Error sending message,please try again later"
        }
        console.log(resp);
    }
}