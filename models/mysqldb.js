const mysql = require("mysql");
const connection = mysql.createConnection({
    host: "127.0.0.1",
    port: '27017',
    user: "root",
    password: '123456',
    database: "fieldequipmentsys_db",
});
connection.connect();

// 数据库操作 curd
const sql = 'select * from addr'
connection.query(sql,(err,result) =>{
    if(err){
        console.log("[select error] -",err.message);
        return;
    };
    console.log("----------");
    console.log(result);
    console.log('----------\n\n'); 
})