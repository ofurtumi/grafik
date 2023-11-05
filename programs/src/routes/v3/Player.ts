import type { Mesh } from "three";

interface Movement {
  [key: string]: boolean;
}
const moveDistance = 0.5;
const keyState: Movement = {}; // Object to hold the state of arrow keys

export const keydown = (event: KeyboardEvent) => {
  keyState[event.code] = true;
};

export const keyup = (event: KeyboardEvent) => {
  keyState[event.code] = false;
};

export const move_player = (obj: Mesh, speed = moveDistance) => {
  let x_move = 0;
  let y_move = 0;

  if (keyState["ArrowUp"]) {
    y_move += speed;
  }
  if (keyState["ArrowDown"]) {
    y_move -= speed;
  }
  if (keyState["ArrowLeft"]) {
    x_move -= speed;
  }
  if (keyState["ArrowRight"]) {
    x_move += speed;
  }

  obj.position.x += x_move;
  obj.position.y += y_move;
  return obj.position;
};
