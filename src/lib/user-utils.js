import dayjs from 'dayjs';
import { signInWithRedirect, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { get } from 'svelte/store';
import { loggedIn, profile, reducedMotion, shouldUpdate, user } from './stores';

/**
 * Check to see if it's a new day, and if so, add user.today to history and reset user.today
 */
export function addToHistory() {
  if (dayjs().isAfter(get(user).lastUpdated, 'day')) {
    user.update(user => {

      // Use unshift for reverse chronological order

      // first, add the last updated day
      user.history.unshift({
        date: user.lastUpdated,
        projects: user.today,
        goal: user.goal,
      });

      // then add possible empty days between last updated and now
      const daysBetween = dayjs().diff(user.lastUpdated, 'day');
      for (let i = 0; i < daysBetween; i++) {
        // 86400000 is the number of ms in a day
        const pastDate = user.lastUpdated + (86400000 * (i + 1));

        // only add the day if today is after the date (otherwise sometimes it'll add the current day)
        if (dayjs().isAfter(pastDate, 'day')) {
          user.history.unshift({
            date: pastDate,
            projects: [],
            goal: user.goal,
          });
        }
      }

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
 * @returns {Promise}
 */
export async function initializeUser(db, newUser) {
  return new Promise((resolve, reject) => {
    shouldUpdate.set(false);

    getDoc(doc(db, 'users', newUser.uid)).then(snapshot => {
      user.set(snapshot?.data() || {});

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
          darkMode: false,
          options: {
            celebration: get(reducedMotion) ? 'none' : 'fireworks',
            colorFilter: 1,
            showMaxStreak: true,
            showStreak: true,
          },
        };

        setDoc(doc(db, 'users', newUser.uid), defaultUserData).then(() => {
          // Not a perfect solution, but the easiest way to make sure user data is correct
          location.reload();
        });
      }
      // If it's not a new user, add past days to their history
      else {
        addToHistory();
      }

      profile.set(newUser);
      loggedIn.set(true);

      resolve();
    }).catch(() => {
      reject();
    });

    // Set up onSnapshot callback for updating from server
    onSnapshot(doc(db, 'users', newUser.uid), doc => {
      // Only update local data if the write is completed
      if (!doc.metadata.hasPendingWrites) {
        shouldUpdate.set(false);
        user.set(doc.data());
      }
    });
  });
}

/**
 * Push local user data to Firestore
 * @param {any} db The Firestore database to push to
 * @param {Object} user The user data to push
 */
export async function pushUser(db, user) {
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

/**
 * Log in with a Google popup and initialize the user if successful
 * @param {any} auth Firebase auth object
 * @param {any} provider Firebase auth provider
 * @param {any} db Firestore database to initialize user in
 */
export async function loginWithGoogle(auth, provider, db) {
  signInWithRedirect(auth, provider)
    .then(result => {
      initializeUser(db, result.user);
    })
    .catch(error => {
      console.log(error);
    });
}

/**
 * Sync to Firestore and then log out the current user and reload the page
 * @param {Object} user The user to log out
 * @param {any} auth Firebase auth object
 * @param {any} db Firestore database to sync to before loggin out
 */
export function logout(user, auth, db) {
  // Sync before logout
  pushUser(db, user);

  signOut(auth)
    .then(() => {
      user.set({});
      loggedIn.set(false);

      // Maybe not the best solution, but it's the easiest way to get the chart to update
      location.reload();
    })
    .catch(error => {
      console.log(error);
    });
}
