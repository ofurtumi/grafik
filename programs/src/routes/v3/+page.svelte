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

  const swap_camera = () => {
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
    console.log("Firing", bullets.length);
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

    const centipedes = [
      Centipede({
        direction: 1,
        length: 15,
        head: new THREE.Vector3(0, 0, 0),
      }),
    ];

    centipedes.forEach((cent) => {
      cent.spheres.forEach((sphere) => scene.add(sphere));
    });

    const [game_map, mushrooms] = Mushrooms(map_size[0], map_size[1]);
    mushrooms.forEach((mushroom) => scene.add(mushroom));

    const light = new THREE.AmbientLight(0x444444, 10);
    light.position.set(0, 0, 0);
    scene.add(light);

    const outsideBounds = (
      position: number,
      direction: number,
      low: number,
      high: number
    ): boolean => {
      if (direction > 0) return position >= high;
      else return position <= low;
    };

    const blocked = (height: number, position: number, direction: number) => {
      return game_map[height][position + direction] > 1;
    };

    const move_worm = (speed: number, cent: CENTIPEDE) => {
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
        blocked(Math.abs(cent.head.y), cent.head.x, cent.direction)
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

      bullets.forEach((bullet, i) => {
        if (bullet.parent !== scene && bullets_alive[i]) scene.add(bullet);
        bullet.position.y += bullet_speed;
        // check if bullet collided with scene object
        if (bullet.position.y > 0) {
          scene.remove(bullet);
          bullets_alive[i] = false;
        } else {
          const [rx, ry] = [
            Math.round(bullet.position.x),
            Math.round(bullet.position.y),
          ];
          const ry_abs = Math.abs(ry);
          if (game_map[ry_abs][rx] > 1) {
            console.log("hit");
            bullets_alive[i] = false;
            scene.remove(bullet);
            game_map[ry_abs][rx] -= 1;
            let scale = (mushrooms[ry_abs].scale.x * 10 - 2) / 10;
            mushrooms[ry_abs].scale.set(scale, scale, scale);
            if (game_map[ry_abs][rx] === 1) {
              scene.remove(mushrooms[ry_abs]);
              score += 1;
            }
          } else {
            centipedes.forEach((cent, u) => {
              if (
                cent.spheres.some(
                  (sphere) =>
                    sphere.position.x === rx && sphere.position.y === ry
                )
              ) {
                bullets_alive[i] = false;
                scene.remove(bullet);
                let cutoff = 0;
                cent.spheres.forEach((sphere, j) => {
                  if (sphere.position.x === rx && sphere.position.y === ry) {
                    cutoff = j;
                    console.log(cutoff, cent.length);
                  }
                });
                score += 10;
                to_remove = { cent, cent_index: u, index: cutoff };
              }
            });
          }
        }
      });

      if (to_remove) {
        let { cent, cent_index, index } = to_remove;
        let tail: THREE.Vector3[] = [];
        if (cent.tail) {
          tail = [...cent.tail];
        }

        if (index === 0 || index === cent.length - 1) {
          console.log(cent.length, index);
          if (tail.length > 0) {
            if (index === 0) cent.head = tail[0];
            cent.tail?.pop();
            cent.length -= 1;
            scene.remove(cent.spheres?.pop() as THREE.Mesh);
            console.log("Rass eða haus");
          } else {
            scene.remove(cent.spheres?.[0] as THREE.Mesh);
            centipedes.splice(cent_index, 1);
          }
        } else {
          console.log("mid");

          cent.tail = tail.slice(0, index);
          scene.remove(cent.spheres?.[index] as THREE.Mesh);
          for (let i = index; i < cent.length; ++i) {
            scene.remove(cent.spheres?.[i] as THREE.Mesh);
          }

          cent.spheres = cent.spheres?.slice(0, index);
          cent.length = index;

          let new_tail = tail.slice(index);
          let new_head = new_tail.shift() as THREE.Vector3;

          new_tail.reverse();

          let new_cent = Centipede({
            direction: -cent.direction,
            length: new_tail.length + 1,
            head: new_head,
            tail: new_tail.length ? new_tail : [],
          });

          new_cent.spheres.forEach((sphere) => scene.add(sphere));

          centipedes.push(new_cent);
        }
        to_remove = null;
      }

      bullets = bullets.filter((_, i) => bullets_alive[i]);
      bullets_alive = bullets_alive.filter((v) => v);

      if (Date.now() - last_centi_move > centi_delay) {
        console.log(centipedes.length);

        centipedes.forEach((cent) => move_worm(1, cent));
        last_centi_move = Date.now();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  };

  onMount(createScene);
</script>

<button on:click={swap_camera}>Skipta um sjónahorn</button>
<h1>Stig: {score}</h1>
<div id="container" bind:this={container} />

<svelte:window
  on:keydown={(e) => {
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
