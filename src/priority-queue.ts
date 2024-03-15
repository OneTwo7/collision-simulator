import { CollisionEvent } from './types';

function intHalf(k: number) {
  return Math.floor(k / 2);
}

function greater(pq: CollisionEvent[], i: number, j: number) {
  return pq[i].frame > pq[j].frame;
}

function exch(pq: CollisionEvent[], i: number, j: number) {
  [pq[i], pq[j]] = [pq[j], pq[i]];
}

function sink(pq: CollisionEvent[], k: number) {
  const n = pq.length - 1;

  while (2 * k <= n) {
    let j = 2 * k;

    if (j < n && greater(pq, j, j + 1)) {
      j++;
    }

    if (!greater(pq, k, j)) {
      break;
    }

    exch(pq, k, j);
    k = j;
  }
}

function swim(pq: CollisionEvent[], k: number) {
  while (k > 1 && greater(pq, intHalf(k), k)) {
    exch(pq, k, intHalf(k));
    k = intHalf(k);
  }
}

export function delMin(pq: CollisionEvent[]) {
  const min = pq[1];
  exch(pq, 1, pq.length - 1);
  pq.length -= 1;
  sink(pq, 1);
  return min;
}

export function insert(pq: CollisionEvent[], event: CollisionEvent) {
  pq.push(event);
  swim(pq, pq.length - 1);
}
