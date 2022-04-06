import dayjs from 'dayjs';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { get } from 'svelte/store';
import { loggedIn, profile, shouldUpdate, user } from './stores';

export function addToHistory() {
  if (dayjs().isAfter(get(user).lastUpdated, 'day')) {
    user.update(user => {
      // Use unshift for reverse chronological order
      user.history.unshift({
        date: user.lastUpdated,
        projects: user.today,
        goal: user.goal,
      });

      user.today = [];
      user.lastUpdated = Date.now();

      return user;
    });
  }
}

export async function updateUser(db, user) {
  addToHistory();
  await setDoc(
    doc(db, 'users', user.uid),
    {
      ...user,
      lastUpdated: Date.now(),
    },
    { merge: true }
  );
}
