import { BoxGeometry, MeshBasicMaterial, Mesh } from "three";
import type { GAME } from "./types";

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

const add = (a: number, b: number, multiple: number) => {
  return (a * multiple + b * multiple) / multiple;
};

const scale_object = (object: THREE.Mesh, scale: number) => {
  object.scale.set(scale, scale, scale);
};

export const shoot = (game: GAME) => {
  const { last_fired, alive, delay } = game.bullet_data;
  if (Date.now() - last_fired < delay) return;
  const bullets = game.bullets;
  const player_pos = game.player_data.pos;

  game.bullet_data.last_fired = Date.now();
  const bullet = new Mesh(
    new BoxGeometry(0.1, 0.1),
    new MeshBasicMaterial({
      color: 0x00ff00,
    }),
  );
  bullet.position.set(player_pos.x, player_pos.y, player_pos.z);
  bullet.rotation.x = Math.PI / 2;
  bullets.push(bullet);
  alive.push(true);
};

export const move_bullet = (game: GAME) => {
  const scene = game.scene;
  const map = game.map.map;
  const mushrooms = game.map.mushrooms;
  game.bullets.forEach((bullet, i) => {
    // if bullet is not in scene, add it
    if (bullet.parent !== scene && game.bullet_data.alive[i]) scene.add(bullet);
    bullet.position.y += game.bullet_data.speed;

    // if bullet has traveled the whole scene, remove it and mark for deletion
    if (bullet.position.y > 0) {
      scene.remove(bullet);
      game.bullet_data.alive[i] = false;
    } else {
      // round bullet position to match with array indexes
      const [rx, ry, ry_abs] = [
        Math.round(bullet.position.x),
        Math.round(bullet.position.y),
        Math.abs(Math.round(bullet.position.y)),
      ];

      // if we hit a mushroom that is still alive, remove the bullet and damage mushroom
      if (map[ry_abs][rx] > 1) {
        scene.remove(bullet);
        game.bullet_data.alive[i] = false;
        map[ry_abs][rx] -= 1;
        let old_scale = mushrooms[ry_abs].scale.x;
        let scale = add(old_scale, -0.2, 10);
        scale_object(mushrooms[ry_abs], scale);
        if (map[ry_abs][rx] === 1) {
          scene.remove(mushrooms[ry_abs]);
          game.score += 1;
        }
      } else {
        // if we hit a centipede, remove the bullet and damage centipede
        game.centipedes.forEach((cent, u) => {
          if (
            cent.spheres &&
            cent.spheres.some(
              (sphere) => sphere.position.x === rx && sphere.position.y === ry,
            )
          ) {
            scene.remove(bullet);
            game.bullet_data.alive[i] = false;
            let cutoff = 0;
            cent.spheres.forEach((sphere, j) => {
              if (sphere.position.x === rx && sphere.position.y === ry) {
                cutoff = j;
              }
            });
            game.score += 10;
            game.centipede_data.to_remove = {
              cent,
              cent_index: u,
              index: cutoff,
            };
          }
        });
      }
    }
  });
};
