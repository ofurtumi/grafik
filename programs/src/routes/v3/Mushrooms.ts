import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";

export const Mushrooms = () => {
  let game_map = new Array(16).fill([]);

  for (let i = 0; i < game_map.length - 1; ++i) {
    let arr = new Array(16).fill(1);
    let available = new Array(13).fill(0).map((_, i) => i + 1);
    let prev = game_map[i - 1] ?? [];
    if (i > 1) {
      available = available.filter((j) => {
        return prev[j - 1] === 1 && prev[j + 1] === 1;
      });
    }

    let position = available[Math.floor(Math.random() * available.length)];
    arr[position] = 5;
    game_map[i] = arr;
  }

  let spheres: THREE.Mesh[] = [];
  for (let i = 0; i < game_map.length; ++i) {
    for (let j = 0; j < game_map[i].length; ++j) {
      let health = game_map[i][j];
      if (health > 0) {
        const geometry = new SphereGeometry(0.08 * health, 16, 16);
        const material = new MeshBasicMaterial({
          color: 0x90aabb * (1 + game_map[i][j]),
        });
        const sphere = new Mesh(geometry, material);
        sphere.position.set(j - 8, 8 - i, 0);
        spheres.push(sphere);
      }
    }
  }
  return [game_map, spheres];
};
