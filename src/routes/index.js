import { firebaseConfig, name } from '$lib/stores';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { get as getStore } from "svelte/store";

const firebaseApp = initializeApp(getStore(firebaseConfig));
const db = getFirestore();

export async function get() {
  const user = (await getDoc(doc(db, 'users', getStore(name))))?.data();

  if (user) {
    return {
      body: {
        fetchedUser: user,
      }
    }
  }

  return {
    status: 401 // Not logged in?
  }
}