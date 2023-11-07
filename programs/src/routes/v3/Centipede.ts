import { Mesh, MeshPhongMaterial, SphereGeometry, Vector3 } from "three";

export interface CENTIPEDE {
  direction: number;
  head: Vector3;
  tail?: Vector3[];
  going_up?: boolean;
  next_up?: boolean;
  length: number;
  spheres?: Mesh[];
  color?: number;
}
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
