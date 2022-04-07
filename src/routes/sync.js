import { firebaseConfig } from '$lib/stores';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

export async function post({ request }) {
  const user = JSON.parse(await request.text());
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...user,
      lastUpdated: Date.now(),
    },
    { merge: true }
  );
}
