import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { firebaseConfig } from '$lib/stores';
import {
  getFirestore,
} from 'firebase/firestore';

export async function load() {
  const app = initializeApp(firebaseConfig);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const db = getFirestore(app);

  // throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693)");
  return {
    app,
    provider,
    auth,
    db,
  };
}
