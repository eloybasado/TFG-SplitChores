const firebase = require("firebase-admin");


const serviceAccount = require("../tfg-split-chores-firebase-adminsdk-7ndnx-d6e018fda8.json");
// const dbUrl = "https://<Your DB>.firebaseio.com";

module.exports = () => {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    // databaseURL: dbUrl,
  });
  console.info("Initialized Firebase SDK");
};