import type { Mesh } from "three";

interface Movement {
  [key: string]: boolean;
}

interface Limits {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const moveDistance = 0.5;
const keyState: Movement = {}; // Object to hold the state of arrow keys

export const keydown = (event: KeyboardEvent) => {
  keyState[event.code] = true;
};

export const keyup = (event: KeyboardEvent) => {
  keyState[event.code] = false;
};

export const move_player = (
  obj: Mesh,
  limits: Limits,
  speed = moveDistance,
) => {
  let x_move = 0;
  let y_move = 0;

  if (keyState["ArrowUp"]) {
    y_move = (y_move * 10 + speed * 10) / 10;
  }
  if (keyState["ArrowDown"]) {
    y_move = (y_move * 10 - speed * 10) / 10;
  }
  if (keyState["ArrowLeft"]) {
    x_move = (x_move * 10 - speed * 10) / 10;
  }
  if (keyState["ArrowRight"]) {
    x_move = (x_move * 10 + speed * 10) / 10;
  }

  obj.position.x += x_move;
  if (obj.position.x < limits.x1) obj.position.x = limits.x1;
  if (obj.position.x > limits.x2) obj.position.x = limits.x2;
  obj.position.y += y_move;
  if (obj.position.y < limits.y1) obj.position.y = limits.y1;
  if (obj.position.y > limits.y2) obj.position.y = limits.y2;
  return obj.position;
};
