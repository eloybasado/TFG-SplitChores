const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');

const initializeFirebaseSDK = require("./database/firebase");
const firebase = require('firebase-admin');
const serviceAccount =require('./tfg-split-chores-firebase-adminsdk-7ndnx-d6e018fda8.json')



require('dotenv').config();

const{dbConnection}=require('./database/configdb');

const app = express();

initializeFirebaseSDK();

dbConnection();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    limits:{fileSize: process.env.MAXSIZEUPLOAD*1024*1024},
    createParentPath:true
}));
app.use(bodyParser.json());

app.use('/api/login', require('./routes/auth.routes'));
app.use('/api/tareas', require('./routes/tareas.routes'));
app.use('/api/grupos', require('./routes/group.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/notificaciones', require('./routes/notifications.routes'));

app.listen(process.env.PORT, ()=>{
    console.log('Servidor: '+process.env.PORT);
});


module.exports = { firebase }