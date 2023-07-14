const mysql=require("mysql");

require('dotenv').config();
const hostname=process.env.HOSTNAME;
const username=process.env.USERNAME;
const pwsd=process.env.PASSWORD;
const db=process.env.DATABASE;
const dbport=process.env.DBPORT;
//console.log(process.env.HOSTNAME);


var pool = mysql.createPool({
    connectionLimit:1000,
    host: hostname,
    user: username,
    password: pwsd,
    database:db,
    port:dbport
    
  });
  
  pool.getConnection((err,connection)=> {
    if(err)
    throw err;
    //console.log('Database connected successfully');
    connection.release();
  });


module.exports=pool;