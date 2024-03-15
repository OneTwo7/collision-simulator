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
import { delMin, insert } from './priority-queue';
import { Ball, CollisionEvent } from './types';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;
const NUMBER_OF_BALLS = 50;
const BALL_RADIUS = 5;
const BALL_SPEED = 2.5;
const BALL_MASS = 10;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const balls: Ball[] = [];
const priorityQueue: CollisionEvent[] = [null];

let frame = 0;

function getSign() {
  return Math.random() > 0.5 ? 1 : -1;
}

for (let i = 0; i < NUMBER_OF_BALLS; i++) {
  const xSpeed = Math.random() * BALL_SPEED;
  const ySpeed = Math.sqrt(BALL_SPEED ** 2 - xSpeed ** 2);

  balls.push({
    x: Math.random() * (CANVAS_WIDTH - 10) + 5,
    y: Math.random() * (CANVAS_HEIGHT - 10) + 5,
    vx: xSpeed * getSign(),
    vy: ySpeed * getSign(),
    count: 0,
  });
}

function drawBall(x: number, y: number, radius: number) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

function getTimeToHit(firstBall: Ball, secondBall: Ball) {
  if (firstBall === secondBall) {
    return Infinity;
  }

  const dx = firstBall.x - secondBall.x;
  const dy = firstBall.y - secondBall.y;
  const dvx = firstBall.vx - secondBall.vx;
  const dvy = firstBall.vy - secondBall.vy;
  const dvdr = dx * dvx + dy * dvy;

  if (dvdr > 0) {
    return Infinity;
  }

  const dvdv = dvx ** 2 + dvy ** 2;
  const drdr = dx ** 2 + dy ** 2;
  const sigma = 2 * BALL_RADIUS;
  const d = dvdr ** 2 - dvdv * (drdr - sigma ** 2);

  if (d < 0) {
    return Infinity;
  }

  return -(dvdr + Math.sqrt(d)) / dvdv;
}

function getTimeToHitWall(ball: Ball) {
  let timeToHitVerticalWall = Infinity;
  let timeToHitHorizontalWall = Infinity;

  if (ball.vx) {
    timeToHitVerticalWall =
      ball.vx > 0 ? (CANVAS_WIDTH - BALL_RADIUS - ball.x) / ball.vx : (ball.x - BALL_RADIUS) / -ball.vx;
  }

  if (ball.vy) {
    timeToHitHorizontalWall =
      ball.vy > 0 ? (CANVAS_HEIGHT - BALL_RADIUS - ball.y) / ball.vy : (ball.y - BALL_RADIUS) / -ball.vy;
  }

  return Math.min(timeToHitVerticalWall, timeToHitHorizontalWall);
}

function bounceOff(firstBall: Ball, secondBall: Ball) {
  const dx = secondBall.x - firstBall.x;
  const dy = secondBall.y - firstBall.y;
  const dvx = secondBall.vx - firstBall.vx;
  const dvy = secondBall.vy - firstBall.vy;
  const dvdr = dx * dvx + dy * dvy;
  const dist = 2 * BALL_RADIUS;
  const j = (2 * BALL_MASS ** 2 * dvdr) / (2 * BALL_MASS * dist);
  const jx = (j * dx) / dist;
  const jy = (j * dy) / dist;
  firstBall.vx += jx / BALL_MASS;
  firstBall.vy += jy / BALL_MASS;
  secondBall.vx -= jx / BALL_MASS;
  secondBall.vy -= jy / BALL_MASS;
  firstBall.count++;
  secondBall.count++;
}

function bounceOffWall(ball: Ball) {
  const { x, y, vx, vy } = ball;

  if ((x + BALL_RADIUS >= CANVAS_WIDTH && vx > 0) || (x - BALL_RADIUS <= 0 && vx < 0)) {
    ball.vx *= -1;
  }

  if ((y + BALL_RADIUS >= CANVAS_HEIGHT && vy > 0) || (y - BALL_RADIUS <= 0 && vy < 0)) {
    ball.vy *= -1;
  }

  ball.count++;
}

function handleBallCollisions(ball: Ball) {
  const timeToHitWall = getTimeToHitWall(ball);

  insert(priorityQueue, {
    frame: timeToHitWall + frame,
    firstBall: ball,
    firstBallCount: ball.count,
  });

  for (const secondBall of balls) {
    const timeToHit = getTimeToHit(ball, secondBall);

    if (timeToHit > 0 && timeToHit !== Infinity) {
      insert(priorityQueue, {
        frame: timeToHit + frame,
        firstBall: ball,
        firstBallCount: ball.count,
        secondBall,
        secondBallCount: secondBall.count,
      });
    }
  }
}

for (const ball of balls) {
  handleBallCollisions(ball);
}

let nextCollision = delMin(priorityQueue);

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  while (nextCollision?.frame < frame) {
    const { firstBall, firstBallCount, secondBall, secondBallCount } = nextCollision;

    if (firstBallCount === firstBall.count && (!secondBall || secondBallCount === secondBall.count)) {
      if (secondBall) {
        bounceOff(firstBall, secondBall);
        handleBallCollisions(firstBall);
        handleBallCollisions(secondBall);
      } else {
        bounceOffWall(firstBall);
        handleBallCollisions(firstBall);
      }
    }

    nextCollision = delMin(priorityQueue);
  }

  for (const ball of balls) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    drawBall(ball.x, ball.y, BALL_RADIUS);
  }

  frame++;

  window.requestAnimationFrame(draw);
}

function init() {
  window.requestAnimationFrame(draw);
}

init();
