import { get } from 'svelte/store';
import { fade, scale } from 'svelte/transition';
import { reducedMotion } from './stores';

/**
 * @param {Element} node
 * @param {import("svelte/transition").FadeParams} options
 */
export function safeScale(node, options) {
  return get(reducedMotion) ? fade(node, options) : scale(node, options);
}
