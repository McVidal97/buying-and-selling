// Import the functions you need from the SDKs you need
import {getFirestore} from "firebase/firestore"
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJXIXygEj3oQGkanP2_I-Ulze14fPo6FI",
  authDomain: "buy-and-selling-app-3e69e.firebaseapp.com",
  projectId: "buy-and-selling-app-3e69e",
  storageBucket: "buy-and-selling-app-3e69e.appspot.com",
  messagingSenderId: "408951216740",
  appId: "1:408951216740:web:751e05afd36d5c68201d71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()