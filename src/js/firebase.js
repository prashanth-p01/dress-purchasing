// Firebase Configuration & Service Initialization
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase Configuration from Vite Environment Variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Database
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics safely
export let analytics = null;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log('✨ Firebase Analytics initialized successfully');
  }
}).catch((err) => {
  console.warn('Firebase Analytics not supported in this environment:', err);
});

console.log('🔥 Firebase connected to project:', firebaseConfig.projectId);

/**
 * Save an order to Firestore 'orders' collection
 * @param {Object} orderData 
 * @returns {Promise<string>} Created document ID
 */
export async function createOrder(orderData) {
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    console.log('Order saved to Firestore with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating order in Firestore: ', error);
    throw error;
  }
}

/**
 * Save email subscriber to 'newsletter' collection
 * @param {string} email 
 * @returns {Promise<string>}
 */
export async function subscribeNewsletter(email) {
  try {
    const docRef = await addDoc(collection(db, 'newsletter_subscribers'), {
      email,
      subscribedAt: serverTimestamp(),
      source: 'vaanika_website'
    });
    console.log('Subscriber saved to Firestore with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding newsletter subscriber: ', error);
    throw error;
  }
}

/**
 * Fetch products from Firestore 'products' collection
 * @returns {Promise<Array>}
 */
export async function getFirestoreProducts() {
  try {
    const q = query(collection(db, 'products'));
    const querySnapshot = await getDocs(q);
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.warn('Firestore products fetch error, fallback to local data:', error);
    return [];
  }
}

export default app;
