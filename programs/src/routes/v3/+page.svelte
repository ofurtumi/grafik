<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Mushrooms } from "./Mushrooms";
  import { move_player, keyup, keydown } from "./Player";
  import { Centipede, type CENTIPEDE } from "./Centipede";

  interface REMOVE {
    cent: CENTIPEDE;
    cent_index: number;
    index: number;
  }

  let container: HTMLDivElement;
  let score = 0;
  let size: number;
  let map_size = [16, 17];
  let follow_player = false;
  let player_pos = new THREE.Vector3(0, 0, 0);
  let last_centi_move = Date.now();
  let centi_delay = 150;
  let last_fired = Date.now();
  const bullet_delay = 200;
  const bullet_speed = 0.2;
  let to_remove: REMOVE | null;
  let camera: THREE.PerspectiveCamera;
  let frozen = false;

  const outsideBounds = (
    position: number,
    direction: number,
    low: number,
    high: number
  ): boolean => {
    if (direction > 0) return position >= high;
    else return position <= low;
  };

  const blocked = (
    height: number,
    position: number,
    direction: number,
    game_map: number[][]
  ) => {
    return game_map[height][position + direction] > 1;
  };

  const add = (a: number, b: number, multiple: number) => {
    return (a * multiple + b * multiple) / multiple;
  };

  const scale_object = (object: THREE.Mesh, scale: number) => {
    object.scale.set(scale, scale, scale);
  };

  const move_bullet = (
    bullets: THREE.Mesh[],
    centipedes: CENTIPEDE[],
    game_map: number[][],
    mushrooms: THREE.Mesh[],
    scene: THREE.Scene
  ) => {
    bullets.forEach((bullet, i) => {
      // if bullet is not in scene, add it
      if (bullet.parent !== scene && bullets_alive[i]) scene.add(bullet);
      bullet.position.y += bullet_speed;

      // if bullet has traveled the whole scene, remove it and mark for deletion
      if (bullet.position.y > 0) {
        scene.remove(bullet);
        bullets_alive[i] = false;
      } else {
        // round bullet position to match with array indexes
        const [rx, ry, ry_abs] = [
          Math.round(bullet.position.x),
          Math.round(bullet.position.y),
          Math.abs(Math.round(bullet.position.y)),
        ];

        // if we hit a mushroom that is still alive, remove the bullet and damage mushroom
        if (game_map[ry_abs][rx] > 1) {
          scene.remove(bullet);
          bullets_alive[i] = false;
          game_map[ry_abs][rx] -= 1;
          let old_scale = mushrooms[ry_abs].scale.x;
          let scale = add(old_scale, -0.2, 10);
          scale_object(mushrooms[ry_abs], scale);
          if (game_map[ry_abs][rx] === 1) {
            scene.remove(mushrooms[ry_abs]);
            score += 1;
          }
        } else {
          // if we hit a centipede, remove the bullet and damage centipede
          centipedes.forEach((cent, u) => {
            if (
              cent.spheres &&
              cent.spheres.some(
                (sphere) => sphere.position.x === rx && sphere.position.y === ry
              )
            ) {
              scene.remove(bullet);
              bullets_alive[i] = false;
              let cutoff = 0;
              cent.spheres.forEach((sphere, j) => {
                if (sphere.position.x === rx && sphere.position.y === ry) {
                  cutoff = j;
                }
              });
              score += 10;
              to_remove = { cent, cent_index: u, index: cutoff };
            }
          });
        }
      }
    });
  };

  const move_centipedes = (
    speed: number,
    cent: CENTIPEDE,
    game_map: number[][]
  ) => {
    if (!cent.tail) return;
    let prev_head = new THREE.Vector3(...cent.head);
    let prev = [prev_head, ...cent.tail.slice(0, cent.tail.length - 1)];

    if (cent.going_up) {
      cent.head.y += speed;
      cent.going_up = cent.head.y !== 0;
    } else if (cent.head.y <= -(map_size[1] - 1) && cent.next_up) {
      cent.next_up = false;
      cent.going_up = true;
    } else if (
      outsideBounds(cent.head.x, cent.direction, 0, map_size[0] - 1) ||
      blocked(Math.abs(cent.head.y), cent.head.x, cent.direction, game_map)
    ) {
      if (cent.head.y === -(map_size[1] - 1)) cent.next_up = true;
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
      let pos: THREE.Vector3;
      if (i === 0) pos = cent.head;
      else pos = cent?.tail?.[i - 1] ?? new THREE.Vector3(0, 0, 0);
      s.position.x = pos.x;
      s.position.y = pos.y;
    });
  };

  const update_centipedes = (
    to_remove: REMOVE | null,
    scene: THREE.Scene,
    centipedes: CENTIPEDE[]
  ) => {
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
          score += 90;
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
    scene: THREE.Scene
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

  const initScene = (container: HTMLDivElement) => {
    // Setting up scene
    size = Math.min(container.offsetWidth, container.offsetHeight);
    const scene = new THREE.Scene();

    // Next the camera
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(7.5, -10, 15);

    // Finally the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    const player = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      })
    );
    player.position.set(7, -map_size[1] - 2, 0);

    return { scene, camera, renderer, player };
  };

  const swap_camera = (camera: THREE.PerspectiveCamera) => {
    if (follow_player) {
      follow_player = false;
      camera.position.set(7.5, -10, 15);
      camera.rotation.x = 0;
    } else {
      follow_player = true;
      camera.rotation.x = Math.PI / 2;
      camera.position.z = 1;
    }
  };

  let bullets: THREE.Mesh[] = [];
  let bullets_alive: boolean[] = [];

  const fire = (event: KeyboardEvent) => {
    if (event.key !== " " || Date.now() - last_fired < bullet_delay) return;
    last_fired = Date.now();
    const bullet = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      })
    );
    bullet.position.set(player_pos.x, player_pos.y, player_pos.z);
    bullet.rotation.x = Math.PI / 2;
    bullets.push(bullet);
    bullets_alive.push(true);
  };

  const createScene = () => {
    const { scene, camera, renderer, player } = initScene(container);

    scene.add(player);

    const centipedes: CENTIPEDE[] = [
      Centipede({
        direction: 1,
        length: 15,
        head: new THREE.Vector3(0, 0, 0),
      }),
    ];

    centipedes.forEach((cent) => {
      if (!cent.spheres) return;
      cent.spheres.forEach((sphere) => scene.add(sphere));
    });

    const [game_map, mushrooms] = Mushrooms(map_size[0], map_size[1]);
    mushrooms.forEach((mushroom) => scene.add(mushroom));

    const light = new THREE.AmbientLight(0x444444, 10);
    light.position.set(0, 0, 0);
    scene.add(light);

    function animate() {
      player_pos = move_player(
        player,
        {
          x1: 0,
          y1: -(map_size[1] + 2),
          x2: map_size[0] - 1,
          y2: -(map_size[1] - 1),
        },
        0.1
      );
      if (follow_player) {
        camera.position.x = player_pos.x;
        camera.position.y = player_pos.y - 1;
      }

      move_bullet(bullets, centipedes, game_map, mushrooms, scene);
      bullets = bullets.filter((_, i) => bullets_alive[i]);
      bullets_alive = bullets_alive.filter((v) => v);

      update_centipedes(to_remove, scene, centipedes);
      if (to_remove) to_remove = null;

      if (Date.now() - last_centi_move > centi_delay && !frozen) {
        centipedes.forEach((cent) => move_centipedes(1, cent, game_map));
        last_centi_move = Date.now();
      }
      centipedes.filter((cent) => cent.spheres && cent.spheres.length > 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  };

  onMount(createScene);
</script>

<div>
  <button on:click={() => swap_camera(camera)}>Skipta um sjónahorn</button>
  freeze: <input type="checkbox" bind:checked={frozen} />
</div>
<h1>Stig: {score}</h1>
<div id="container" bind:this={container} />

<svelte:window
  on:keydown|preventDefault={(e) => {
    keydown(e);
    fire(e);
  }}
  on:keyup={keyup}
/>

<style>
  #container {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
