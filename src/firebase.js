import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDPCOkh7c_TOvgdKVPAbUr13lt7M6luyko",
    authDomain: "pwr-chess-september.firebaseapp.com",
    projectId: "pwr-chess-september",
    storageBucket: "pwr-chess-september.appspot.com",
    messagingSenderId: "490705747935",
    appId: "1:490705747935:web:46953cdb8d7bdb006c4e6a"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }