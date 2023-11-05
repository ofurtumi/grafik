<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Mushrooms } from "./Mushrooms";
  import { move_player, keyup, keydown } from "./Player";
  import { Centipede, type CENTIPEDE } from "./Centipede";

  let container: HTMLDivElement;
  let size: number;
  let map_size = [16, 17];
  let follow_player = false;
  let player_pos = new THREE.Vector3(0, 0, 0);
  let centi_speed = Date.now();
  let last_fired = Date.now();
  const bullet_rate = 100;
  const bullet_speed = 0.2;
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

  const fire = (event: KeyboardEvent) => {
    if (event.key !== " " || Date.now() - last_fired < bullet_rate) return;
    last_fired = Date.now();
    console.log("Firing", bullets.length);
    const bullet = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      })
    );
    bullet.position.set(player_pos.x, player_pos.y, player_pos.z);
    bullet.rotation.x = Math.PI / 2;
    bullets.push(bullet);
  };

  const createScene = () => {
    const { scene, camera, renderer, player } = initScene(container);

    const c1 = Centipede({
      direction: 1,
      length: 10,
      head: new THREE.Vector3(0, 0, 0),
    });

    scene.add(player);

    const c2 = Centipede({
      direction: -1,
      length: 5,
      head: new THREE.Vector3(map_size[0] - 1, 0, 0),
    });

    const centipedes = [c1, c2];

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

      let slicepoint = 0;
      bullets.forEach((bullet, i) => {
        bullet.position.y += bullet_speed;
        scene.add(bullet);
        if (bullet.position.y > 0) {
          scene.remove(bullet);
          slicepoint = i;
        }
      });

      bullets = bullets.slice(slicepoint);

      if (Date.now() - centi_speed > 100) {
        centipedes.forEach((cent) => move_worm(1, cent));
        centi_speed = Date.now();
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  };

  onMount(createScene);
</script>

<button on:click={swap_camera}>Skipta um sjónahorn</button>
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
