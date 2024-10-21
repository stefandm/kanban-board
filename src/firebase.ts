// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIdfV4qdAUg1pBWl7PGgwnMeE5n7zpUZQ",
  authDomain: "kanban-29a8e.firebaseapp.com",
  projectId: "kanban-29a8e",
  storageBucket: "kanban-29a8e.appspot.com",
  messagingSenderId: "828301283650",
  appId: "1:828301283650:web:385e59aa3d54431beab8db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);