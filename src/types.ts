export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  count: number;
};

export type CollisionEvent = {
  frame: number;
  firstBall: Ball;
  firstBallCount: number;
  secondBall?: Ball;
  secondBallCount?: number;
};
