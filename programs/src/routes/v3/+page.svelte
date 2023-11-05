<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Mushrooms } from "./Mushrooms";
  import { Centipede, type CENTIPEDE } from "./Centipede";

  let container: HTMLDivElement;
  let size: number;
  let map_size = [16, 17];

  const createScene = () => {
    size = Math.min(container.offsetWidth, container.offsetHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(7.5, -9, 15);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    const c1 = Centipede({
      direction: 1,
      length: 10,
      head: new THREE.Vector3(0, 0, 0),
    });

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
    light.position.set(0, 2, 2);
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
      centipedes.forEach((cent) => move_worm(1, cent));
      renderer.render(scene, camera);
      requestAnimationFrame(() => setTimeout(animate, 100));
    }

    animate();
  };

  onMount(createScene);
</script>

<div id="container" bind:this={container} />

<style>
  #container {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
