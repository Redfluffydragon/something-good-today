import { writable } from "svelte/store";

export const reducedMotion = writable(false);

export let projects = writable([]);

export let name = writable('Kai');
