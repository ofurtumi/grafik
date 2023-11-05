import { Mesh, MeshPhongMaterial, SphereGeometry, Vector3 } from "three";

export interface CENTIPEDE {
  direction: number;
  head: Vector3;
  tail?: Vector3[];
  going_up?: boolean;
  next_up?: boolean;
  length: number;
  spheres?: Mesh[];
}
export const Centipede = ({
  direction,
  going_up = false,
  next_up = false,
  head,
  tail,
  length,
}: CENTIPEDE) => {
  if (!tail) {
    tail = new Array(length - 1).fill(new Vector3(0, 0, 0));
  }

  const sphereGeometry = new SphereGeometry(0.4, 32, 32);
  const sphereMaterial = new MeshPhongMaterial({ color: 0x32ff00 });
  const spheres = new Array(length).fill(0).map((_) => {
    return new Mesh(sphereGeometry, sphereMaterial);
  });

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

let direction = 1;
let going_up = false;
let next_up = false;
let positions = new Array(10).fill(0).map((_) => {
  return { x: 0, y: 0 };
});

const outsideBounds = (
  position: number,
  direction: number,
  low: number,
  high: number,
): boolean => {
  if (direction > 0) return position >= high;
  else return position <= low;
};

const blocked = (height: number, position: number, direction: number) => {
  return game_map[height][position + direction] > 1;
};

const move_worm = (speed: number) => {
  const head = spheres[0].position;
  if (going_up) {
    head.y += speed;
    going_up = head.y !== 0;
  } else if (head.y <= -15 && next_up) {
    next_up = false;
    going_up = true;
  } else if (
    outsideBounds(head.x, direction, 0, 15) ||
    blocked(Math.abs(head.y), head.x, direction)
  ) {
    if (head.y === -15) next_up = true;
    else head.y -= speed;
    direction *= -1;
  } else {
    head.x += speed * direction;
  }

  for (let i = 0; i < positions.length; ++i) {
    if (i === 9) positions[i] = { x: head.x, y: head.y };
    else {
      let { x, y } = positions[i + 1];
      positions[i] = { x: x, y: y };
    }
  }
  spheres.slice(1).forEach((s, i) => {
    let pos = positions[i];
    s.position.x = pos.x;
    s.position.y = pos.y;
  });
};
