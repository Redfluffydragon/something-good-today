/**
Somewhat based on this: https://medium.com/front-end-weekly/how-to-add-some-fireworks-to-your-website-18b594b06cca
But using canvas and Svelte easing functions and stuff. 
*/

import { expoOut, quadIn } from 'svelte/easing';

// canvas element
let canvas;

// drawing context
let context;

// center of the canvas
let center = {};

// Max lifespan in frames (approximately)
let maxLifespan = 120;

// spread of the firework - set to half the minimum dimension of the canvas
let spread;

// gravity constant (arbitrary)
const gravity = 0.2;

// to track acceleration from gravity
let downVel = gravity;

// For changing color
let hue = 59;

/**
 * Set up to play a fireworks animation. Returns a fireworks function you can call to play fireworks
 * @param {HTMLCanvasElement} newCanvas A canvas to draw on
 * @returns {function fireworks(options:{Object})}
 */
function create(newCanvas) {
  canvas = newCanvas;
  context = canvas.getContext('2d');

  return fireworks;
}

/**
 * Play the fireworks animation
 * @param {Object} options
 */
async function fireworks(options = {}) {
  const minDim = Math.min(canvas.offsetHeight, canvas.offsetWidth);

  const defaults = {
    particleCount: 70,
    countdown: maxLifespan,
    origin: { x: 0.5, y: 0.5 },
    bursts: [
      {
        delay: 0,
        offset: { x: 0, y: 0 },
        velocities: randomVelocities(options.particleCount || 70),
      },
      {
        delay: 20,
        offset: { x: Math.random() * minDim / 2 - minDim / 4, y: Math.random() * minDim / 2 - minDim / 4 },
        velocities: randomVelocities(options.particleCount || 70),
      },
      {
        delay: 40,
        offset: { x: Math.random() * minDim / 2 - minDim / 4, y: Math.random() * minDim / 2 - minDim / 4 },
        velocities: randomVelocities(options.particleCount || 70),
      }
    ],
  };
  options = { ...defaults, ...options };

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  center.x = canvas.offsetWidth * options.origin.x;
  center.y = canvas.offsetHeight * options.origin.y;

  spread = minDim / 2;

  context.fillStyle = `hsl(${hue}, 100%, 76%)`;
  context.strokeStyle = 'none';

  const promise = new Promise(resolve => {
    // reset downwards velocity
    downVel = gravity;
    drawFireworkParticles(options, resolve);
  });

  return promise;
}

/**
 * Draw an ellipse at the given x and y
 * @param {number} x x-coordinate on the canvas
 * @param {number} y y-coordinate on the canvas
 */
function fireworkPoint(x, y) {
  context.ellipse(x, y, 4, 4, 0, 0, Math.PI * 2);
}

function randomVelocities(number, scale = 1.4, randomness = 0.3) {
  return Array.from(new Array(number), () => {
    return { x: scale - Math.random() * randomness, y: scale- Math.random() * randomness };
  });
}

/**
 * Draw firework particles - animates recursively with requestAnimationFrame
 * @param {Object} options 
 * @param {function} resolve 
 * @returns {void}
 */
function drawFireworkParticles(options, resolve) {
  // Clear the canvas before checking if it should stop
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (options.countdown === 0) {
    resolve();
    return;
  }

  requestAnimationFrame(() => {
    drawFireworkParticles(options, resolve);
  });

  for (const burst of options.bursts) {
    if (maxLifespan - options.countdown > burst.delay) {

      // Rotate the hue for color fading
      context.fillStyle = `hsl(${hue - burst.delay * 5}, 100%, 76%)`;
      hue += 5;

      for (let i = 0; i < options.particleCount; i++) {
        const rotation = (i / options.particleCount) * Math.PI * 2;
        const time = 1 - (options.countdown + burst.delay) / maxLifespan;

        context.beginPath();
        fireworkPoint(
          // start |     direction      | spread | air resistance | initial velocity | extra to make it keep moving   | gravity
          center.x + burst.offset.x + Math.cos(rotation) * spread * (expoOut(time) * burst.velocities[i].x + quadIn(time) * burst.velocities[i].x),
          center.y + burst.offset.y + Math.sin(rotation) * spread * (expoOut(time) * burst.velocities[i].y + quadIn(time) * burst.velocities[i].y) + quadIn(time) * downVel
        );
        downVel += gravity;

        context.fill();
      }
    }
  }

  options.countdown--;
}

export default {
  create: create,
};
