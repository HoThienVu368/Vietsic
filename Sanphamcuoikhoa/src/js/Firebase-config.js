// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAy7fYCGXrKfFo_66nm5cSB7Qa5ca7Wt54",
    authDomain: "vietsic.firebaseapp.com",
    projectId: "vietsic",
    storageBucket: "vietsic.firebasestorage.app",
    messagingSenderId: "688895114858",
    appId: "1:688895114858:web:84365671f4acb335dc1413"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  // Đăng Ký đăng nhập
  const auth = firebase.auth()
  //  Database
  const db = firebase.firestore();
  
  console.log(firebase.app().name);