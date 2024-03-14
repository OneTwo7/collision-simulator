/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { Ball } from './types';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const NUMBER_OF_BALLS = 50;
const BALL_RADIUS = 5;
const BALL_SPEED = 2.5;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const balls: Ball[] = [];

function getSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

for (let i = 0; i < NUMBER_OF_BALLS; i++) {
  const xSpeed = Math.random() * BALL_SPEED;
  const ySpeed = Math.sqrt(BALL_SPEED ** 2 - xSpeed ** 2);

  balls.push({
    x: Math.random() * (CANVAS_WIDTH - 10) + 5,
    y: Math.random() * (CANVAS_HEIGHT - 10) + 5,
    dir: [xSpeed * getSign(), ySpeed * getSign()],
  });
}

function drawBall(x: number, y: number, radius: number) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function handleBorderCollision(ball: Ball) {
  const { x, y } = ball;

  if (x + BALL_RADIUS >= CANVAS_WIDTH || x - BALL_RADIUS <= 0) {
    ball.dir[0] *= -1;
  }

  if (y + BALL_RADIUS >= CANVAS_HEIGHT || y - BALL_RADIUS <= 0) {
    ball.dir[1] *= -1;
  }
}

function draw() {
  const date = new Date();

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (const ball of balls) {
    ball.x += ball.dir[0];
    ball.y += ball.dir[1];

    drawBall(ball.x, ball.y, BALL_RADIUS);
    handleBorderCollision(ball);
  }

  window.requestAnimationFrame(draw);
}

function init() {
  window.requestAnimationFrame(draw);
}

init();
