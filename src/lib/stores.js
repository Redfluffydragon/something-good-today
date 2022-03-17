import { browser } from "$app/env";
import { readable, writable } from "svelte/store";

export const reducedMotion = writable(false);

export const darkMode = writable(browser && localStorage.getItem('darkMode') === 'true');

export const user = writable({});

export const firebaseConfig = readable({
  apiKey: "AIzaSyAHCt552UgH7VJGxjiFJlH1D0iLYxuE8iQ",
  authDomain: "something-good-70b39.firebaseapp.com",
  projectId: "something-good-70b39",
  storageBucket: "something-good-70b39.appspot.com",
  messagingSenderId: "805543978877",
  appId: "1:805543978877:web:d425996272cc609a368e14"
});
