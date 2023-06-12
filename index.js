const nodeCron = require("node-cron");
const winston = require('winston');
var conn=require('./connection');
require('dotenv').config();
const { convertPhoneNumberToInternationFormat } = require('@toluwap/phone-number-formatter');


//let fileName=new Date().getDay()+1+"-"+new Date().getMonth()+1+"-"+new  Date().getFullYear()+".log";
let fileName=ReturnDate()+".log";
const logConfiguration = {
    
    'transports': [
        
        
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

const job = nodeCron.schedule("10 * * * * *", async function jobYouNeedToExecute() {
  // Do whatever you want in here. Send email, Make  database backup or download data.
  let response=0;
  let sms=[];
  let phone=[];
  let msg="";
  let smsID=[];
  
  
    let smsc=await ReturnSMS().then(function(value) {
        sms=value;
        (sms).forEach(async element => {
           // const phoneNumbers1 = convertPhoneNumberToInternationFormat({phoneNumbers: element['smsTo'], options: { prepend: '+'}});
            let result=await SendSMS(element['smsTo'],element['sms']).then(async function(val){
                logger.info("")
                console.log("Sending SMS Value:",val);
                if(val=="Success"){
                    console.log("Operation 1,"+val+"SMS ID:"+element['smsID']);
                    
                    let up=await UpdateSMSStatus(1,element['smsID']).then(function(vv){
                        logger.info("SMS Successfully sent to:"+element['smsTo']);
                    }).catch(function(vx){
                        logger.error("Error Updating SMS Status:"+vx)
                    })
                }else{
                    
                    console.log("Operation 2,"+val+"SMS ID:"+element['smsID']);
                    
                    let up=await UpdateSMSStatus(1,element['smsID']).then(function(vvv){
                        logger.info("SMS Successfully sent to:"+element['smsTo']);
                    }).catch(function(vvx){
                        logger.error("Error Updating SMS Status:"+vvx)
                    })
                }
            }).catch(function(v){
                console.log("Error Value:",v);
            })
        });
    }).catch(function(err){
        console.log("Error:",err.message);
    });
  
  
    /*SendSMSs(phone,sms);
    (smsID).forEach(async element=>{
        let u="";
        let up=await UpdateSMSStatus(1,element['smsID']).then(function(value){
            logger.info("SMS Successfully sent to:"+smsID.length+" Phone Number(s)");
        }).catch(function(v){
            logger.error("Error Updating SMS Status:"+v)
        })
    })*/
        
        /*let result=await SendSMS(element['smsTo'],element['sms']).then(async function(value){
            response=value;
            console.log("Value",value);
            logger.info("Result from Sending SMS:"+response)
            //if(response=1){
                //update
                let u="";
                let up=await UpdateSMSStatus(1,element['smsID']).then(function(value){
                    logger.info("SMS Successfully sent to:"+element['smsTo']);
                }).catch(function(v){
                    logger.error("Error Updating SMS Status:"+v)
                })*/
            /*}else{
                let u="";
                let up=await UpdateSMSStatus(3,element['smsID']).then(function(value){
                    logger.error("Error Sending SMS to:"+element['smsTo']);
                }).catch(function(v){
                    
                })
            }*/
       /* }).catch(function(v){

        });
    //});*/
/*}).catch(function(v) {
    allusers=v;
  });*/
  console.log(new Date().toLocaleString());
});


const SendSMS=async(phone,sms)=>{
    return new Promise(function(resolve,reject){
        let body={
            "api_key":apikey,
            "to":phone,
            "from":"N-Alert",
            "sms":sms,
            "type":"plain",
            "channel":"dnd"
        }
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
            
            logger.info(response.data);
            logger.info(JSON.stringify(response.data.message));
            if(response.data.message=="Successfully Sent"){
                resolve("Success");
            }else{
                reject("Failed")
            }
            /*if(response.data.message==="Successfully Sent"){
                let resp={
                    ResponseCode:"00",
                    ResponseMessage:response.data.message,
                    
                }
                
               
            }else{
                let resp={
                    ResponseCode:"69",
                    ResponseMessage:response.data.message,
                    
                }
                reject(0);
                
            }*/
          })
        }catch(err){
            console.log("SMS Sending Error:"+err.message);
            logger.error("Error:"+err.message)
reject("Failed")
        }
    })
}
const SendSMSs=async (phone,sms)=>{
    let body={
        "api_key":apikey,
        "to":phone,
        "from":"N-Alert",
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

const ReturnSMS=async()=>{
    var row=[];
    return new Promise(function(resolve,reject){
        var query="SELECT * FROM smsnew where DATE(smsDate) = CURDATE() AND smsStatus='0'";
    conn.query(query,(err,rows)=>{
            if(!err){
                
            //cnt=rows[0].cnt;
            row=rows;
                
                resolve(row)
                
            }else{
                cnt=0;
                reject(row);
            }
        })
        
    })
}

const UpdateSMSStatus=async(status,smsID)=>{
    console.log("Status:"+status);
    console.log("SMS ID:"+smsID);
    //var status=0;
    return new Promise(function(resolve,reject){
        var query="UPDATE smsnew SET smsStatus='"+status+"' WHERE smsID='"+smsID+"'";
        //var query="UPDATE smsnew SET smsStatus='1' WHERE smsID='3'";
    conn.query(query,(err,rows)=>{
            if(!err){
                
            //cnt=rows[0].cnt;
            status=1;
                
                resolve(1)
                
            }else{
                logger.info("Error Updating Status with smsID:"+smsID+" Status:"+status);
                console.log("Error Updating",err.message);
                cnt=0;
                reject(0);
            }
        })
        
    })
}

function ReturnDate(){
    let date_time = new Date();

// get current date
// adjust 0 before single digit date
let date = ("0" + date_time.getDate()).slice(-2);

// get current month
let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

// get current year
let year = date_time.getFullYear();

// get current hours
let hours = date_time.getHours();

// get current minutes
let minutes = date_time.getMinutes();

// get current seconds
let seconds = date_time.getSeconds();

// prints date in YYYY-MM-DD format
return year + "-" + month + "-" + date;
}
