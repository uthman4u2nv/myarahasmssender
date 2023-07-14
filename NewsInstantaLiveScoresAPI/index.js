const winston = require('winston');
const nodeCron = require("node-cron");
//const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
//const wss = new WebSocket.Server({ port: 7071 });
var conn=require('./connection');
require('dotenv').config();
//const http = require('http');
//const server = http.Server(app);

//const socketIO = require('socket.io');
//const io = socketIO(server);

var axios = require('axios');
let fileName=ReturnDate()+".log";
const key=process.env.KEY;
const secret=process.env.SECRET;
const url=process.env.LIVESCORESURL;
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
//return datetime
function ReturnDateTime(){
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
return year + "-" + month + "-" + date+" "+hours+":"+minutes+":"+seconds;
}
const job = nodeCron.schedule("10 * * * * *", async function jobYouNeedToExecute() {
    let c=0;
    try{
        let endpoint=url+"="+key+"&secret="+secret;
        console.log("Calling endoint:"+endpoint);
        //try connecting to livescores api
        axios.get(endpoint).then(async function (response){
            
            (response.data.data.match).forEach(async element => {
                logger.info(element['home_name']+" "+element['score']+" "+element['away_name']);
                console.log(element['home_name']+" "+element['score']+" "+element['away_name']);

                let result=await InsertFeeds(element['score'],element['away_id'],element['ht_score'],element['home_name'],element['competition_name'],element['league_name'],element['country'],element['h2h'],element['status'],element['home_id'],element['ft_score'],element['ps_score'],element['location'],element['et_score'],element['time'],element['away_name']).then(async function(val){
                    c=val;
                    if(val==1){
                        console.log("Inserted successfully");
                    }else{
                        console.log("Insertion failed");
                    }
                })
                
            })
            //console.log(JSON.stringify(response.data));
        });

    }catch(err){
            console.log("Error Spooling from livescores:"+err.message);
            logger.error("Error:"+err.message);
    }
});


const InsertFeeds=async(score,away_id,ht_score,home_name,competition,league,country,h2h,status,home_id,ft_score,ps_score,location,et_score,time,away_name)=>{
    let fetchID=uuidv4();
    let datetime=ReturnDateTime();
    try{
    //var status=0;
    return new Promise(function(resolve,reject){
        var query="INSERT INTO livescores(datetime,fetchID,score,away_id,ht_score,home_name,competition,league,country,h2h,status,home_id,ft_score,ps_score,location,et_score,time,away_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        //var query="UPDATE smsnew SET smsStatus='1' WHERE smsID='3'";
    conn.query(query,[datetime,fetchID,score,away_id,ht_score,home_name,competition,league,country,h2h,status,home_id,ft_score,ps_score,location,et_score,time,away_name],(err,rows)=>{
            if(!err){
                
            //cnt=rows[0].cnt;
            status=1;
                
                resolve(1)
                
            }else{
                logger.info("Error Inserting Feeds");
                console.log("Error Updating",err.message);
                cnt=0;
                reject(0);
            }
        })
        
    })
}catch(err){
    logger.error("Error Inserting Feeds:"+err.message);
}
}