import { browser } from '$app/environment';
import { readable, writable } from 'svelte/store';

export const titleSuffix = '- Something Good Today';

export const reducedMotion = readable(false, set => {
  if (!browser) return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  set(mediaQuery.matches);

  mediaQuery.addEventListener('change', () => {
    set(mediaQuery.matches);
  });
});

export const user = writable({ options: {} });
export const profile = writable();
export const loggedIn = writable(false);

export const shouldUpdate = writable(false);

export const historyShown = writable((browser && localStorage.getItem('historyShown')) || '7');

export const firebaseConfig = {
  apiKey: 'AIzaSyAHCt552UgH7VJGxjiFJlH1D0iLYxuE8iQ',
  authDomain: 'app.something-good.today',
  projectId: 'something-good-70b39',
  storageBucket: 'something-good-70b39.appspot.com',
  messagingSenderId: '805543978877',
  appId: '1:805543978877:web:d425996272cc609a368e14',
};

export const demoUserData = {
  goal: '3',
  nextId: 6,
  projects: {
    0: {
      color: '#ff2962',
      id: 0,
      title: 'Write',
    },
    1: {
      color: '#9573c7',
      id: 1,
      title: 'Practice instrument',
    },
    2: {
      color: '#f5d51e',
      id: 2,
      title: 'Yes',
    },
    3: {
      color: '#e41b57',
      id: 3,
      title: 'Things',
    },
    4: {
      color: '#6119ac',
      id: 4,
      title: 'Sample project',
    },
    5: {
      color: '#4aa260',
      id: 5,
      title: 'Stuff',
    },
  },
  activeProjects: [0, 1, 2, 4, 5],
  finishedProjects: [3],
  deletedProjects: [],
  today: [4, 1, 2],
  history: [
    {
      date: 1648092427427,
      goal: '3',
      projects: [0, 1, 3],
    },
    {
      date: 1648006027427,
      goal: '3',
      projects: [3, 4, 5],
    },
  ],
  darkMode: false,
  options: {
    celebration: 'fireworks',
    colorFilter: 1,
    showMaxStreak: true,
    showStreak: true,
  },
};
