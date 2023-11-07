import { Mesh, MeshPhongMaterial, SphereGeometry, Vector3 } from "three";
import type { CENTIPEDE, GAME, MAP } from "./types";

export const Centipede = ({
  direction,
  going_up = false,
  next_up = false,
  head,
  tail,
  length,
  color = 0x32ff00,
}: CENTIPEDE) => {
  if (!tail) {
    tail = new Array(length - 1).fill(new Vector3(0, 0, 0));
  }

  const sphereGeometry = new SphereGeometry(0.4, 32, 32);
  const sphereMaterial = new MeshPhongMaterial({ color: color });
  let spheres = new Array(length).fill(0).map((_) => {
    return new Mesh(sphereGeometry, sphereMaterial);
  });

  if (spheres.length > 0 && head) {
    let { x, y, z } = head;
    spheres[0].position.set(x, y, z);
    for (let i = 0; i < length - 1; i++) {
      let { x, y, z } = tail[i];
      spheres[i + 1].position.set(x, y, z);
    }
  } else spheres = [];

  return {
    direction,
    going_up,
    next_up,
    head,
    tail,
    length,
    spheres,
  };
};

const outsideBounds = (
  position: number,
  direction: number,
  low: number,
  high: number,
): boolean => {
  if (direction > 0) return position >= high;
  else return position <= low;
};

const blocked = (
  height: number,
  position: number,
  direction: number,
  game_map: number[][],
) => {
  return game_map[height][position + direction] > 1;
};

export const move_centipedes = (speed: number, cent: CENTIPEDE, map: MAP) => {
  if (!cent.tail) return;
  let prev_head = new Vector3(...cent.head);
  let prev = [prev_head, ...cent.tail.slice(0, cent.tail.length - 1)];

  if (cent.going_up) {
    cent.head.y += speed;
    cent.going_up = cent.head.y !== 0;
  } else if (cent.head.y <= -(map.height - 1) && cent.next_up) {
    cent.next_up = false;
    cent.going_up = true;
  } else if (
    outsideBounds(cent.head.x, cent.direction, 0, map.width - 1) ||
    blocked(Math.abs(cent.head.y), cent.head.x, cent.direction, map.map)
  ) {
    if (cent.head.y === -(map.height - 1)) cent.next_up = true;
    else cent.head.y -= speed;
    cent.direction *= -1;
  } else {
    cent.head.x += speed * cent.direction;
  }

  for (let i = 0; i < prev.length; ++i) {
    cent.tail[i] = prev[i];
  }

  if (!cent.spheres) return;
  cent.spheres.forEach((s, i) => {
    let pos: Vector3;
    if (i === 0) pos = cent.head;
    else pos = cent?.tail?.[i - 1] ?? new Vector3(0, 0, 0);
    s.position.x = pos.x;
    s.position.y = pos.y;
  });
};

export const update_centipedes = (game: GAME) => {
  const scene = game.scene;
  const centipedes = game.centipedes;

  const to_remove = game.centipede_data.to_remove;
  if (!to_remove) return;
  let { cent, cent_index, index } = to_remove;

  // if the shot hit the head or butt
  if (index === 0 || index === cent.length - 1) {
    // the centipede is not just a head
    if (cent.tail && cent.length > 1) {
      // if we hit the head, make the next sphere the new head
      if (index === 0) {
        cent.head = cent.tail[0];
        // if we hit the head, we also get more points
        game.score += 90;
      } // and remove the last sphere to makes the centipede shorter
      cent.tail?.pop();
      cent.length -= 1;
      // here we remove it from the scene and the spheres array in one line, very pretty :)
      scene.remove(cent.spheres?.pop() as THREE.Mesh);
    } else {
      // if we shot the last sphere, remove the whole centipede
      scene.remove(cent.spheres?.[0] as THREE.Mesh);
      centipedes.splice(cent_index, 1);
    }
  } else {
    // if we shot a sphere in the middle, split the centipede in two
    const new_cent = split_centipede(cent, index, scene);
    new_cent.spheres.forEach((sphere) => scene.add(sphere));
    centipedes.push(new_cent);
  }
};

const split_centipede = (
  cent: CENTIPEDE,
  split_point: number,
  scene: THREE.Scene,
) => {
  // we destructure the tail and make a copy of it that only includes the points we want
  let new_tail: THREE.Vector3[] = [];
  if (cent.tail) {
    new_tail = [...cent.tail.slice(split_point)];
  }
  // we pop the back of our new tail to get a head that faces the other direction
  let new_head = new_tail.pop() as THREE.Vector3;

  let new_direction =
    Math.abs(new_head.y - cent.head.y) % 2 === 0
      ? -cent.direction
      : cent.direction;

  let new_cent = Centipede({
    direction: new_direction,
    length: new_tail.length + 1,
    head: new_head,
    tail: new_tail.length ? new_tail : [],
  });

  // we modify the old centipede and remove the points from
  // the scene, tail, spheres array and length
  for (let i = split_point; i < cent.length; ++i) {
    scene.remove(cent.spheres?.[i] as THREE.Mesh);
  }
  cent.tail = cent?.tail?.slice(0, split_point);
  cent.spheres = cent.spheres?.slice(0, split_point);
  cent.length = split_point;

  // and finally return the new centipede
  return new_cent;
};
