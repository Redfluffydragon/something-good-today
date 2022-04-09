import { get } from 'svelte/store';
import { user } from './stores';

/**
 * Sort an array into the same order as active projects. Inactive projects are sorted to the back of the array.
 * @param {int} project1
 * @param {int} project2
 * @returns {int}
 */
export const sortByActive = (project1, project2) => {
  const index1 = get(user).activeProjects.indexOf(project1);
  const index2 = get(user).activeProjects.indexOf(project2);
  // If a project isn't in active projects (i.e. finshed or deleted) sort it to the back
  // Not sure if this is the best solution
  return (index1 > -1 ? index1 : Infinity) - (index2 > -1 ? index2 : Infinity);
};

/**
 * Converts the title to lowercase and replaces whitespace with hypens
 * @param {string} title
 */
export function titleToId(title) {
  return title.toLowerCase().replace(/\s/g, '-');
}
