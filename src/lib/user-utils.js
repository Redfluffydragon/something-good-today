import dayjs from 'dayjs';
import { signInWithPopup } from 'firebase/auth';
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

/**
 * Initialize a user, whether it's a new user or just logging in again
 * @param {any} db The Firestore database to access
 * @param {Object} newUser The user data
 * @returns {void}
 */
export async function initializeUser(db, newUser) {
  shouldUpdate.set(false);
  user.set((await getDoc(doc(db, 'users', newUser.uid)))?.data());
  profile.set(newUser);
  loggedIn.set(true);

  // Set up onSnapshot callback for updating from server
  onSnapshot(doc(db, 'users', newUser.uid), doc => {
    // Only update local data if the write is completed
    if (!doc.metadata.hasPendingWrites) {
      shouldUpdate.set(false);
      user.set(doc.data());
    }
  });

  // If user is undefined, it's a new user and we need to create a doc in Firestore
  if (!get(user)) {
    const defaultUserData = {
      goal: '1',
      nextId: 0,
      projects: {},
      activeProjects: [],
      finishedProjects: [],
      deletedProjects: [],
      today: [],
      history: [],
      lastUpdated: Date.now(),
      uid: newUser.uid,
      celebration: 'confetti',
    };

    await setDoc(doc(db, 'users', newUser.uid), defaultUserData);

    // Not a perfect solution, but the easiest way to make sure user data is correct
    location.reload();
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

export async function loginWithGoogle(auth, provider, db) {
  signInWithPopup(auth, provider)
    .then(result => {
      initializeUser(db, result.user);
    })
    .catch(error => {
      console.log(error);
    });
}
