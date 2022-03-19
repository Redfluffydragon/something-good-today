import { browser } from "$app/env";
import { readable, writable } from "svelte/store";

export const reducedMotion = writable(false);

export const darkMode = writable(browser && localStorage.getItem('darkMode') === 'true');

export const user = writable({});
export const profile = writable();

export const firebaseConfig = readable({
  apiKey: "AIzaSyAHCt552UgH7VJGxjiFJlH1D0iLYxuE8iQ",
  authDomain: "something-good-70b39.firebaseapp.com",
  projectId: "something-good-70b39",
  storageBucket: "something-good-70b39.appspot.com",
  messagingSenderId: "805543978877",
  appId: "1:805543978877:web:d425996272cc609a368e14"
});

export const loggedIn = writable(false);

export const demoUserData = readable({
  goal: "3",
  name: "Demo user",
  nextId: 6,
  projects: [
    {
      color: "#6119ac",
      id: 4,
      title: "Sample project",
    },
    {
      color: "#ff2962",
      id: 0,
      title: "Write",
    },
    {
      color: "#9573c7",
      id: 1,
      title: "Practice instrument",
    },
    {
      color: "#f5d51e",
      id: 2,
      title: "Yes",
    },
    {
      color: "#4aa260",
      id: 5,
      title: "Stuff",
    }
  ],
  finishedProjects: [
    {
      color: "#e41b57",
      id: 3,
      title: "Things",
    },
  ],
  today: [
    {
      color: "#6119ac",
      id: 4,
      title: "Sample project",
    },
    {
      color: "#9573c7",
      id: 1,
      title: "Practice instrument",
    },
    {
      color: "#f5d51e",
      id: 2,
      title: "Yes",
    },
  ]
})
