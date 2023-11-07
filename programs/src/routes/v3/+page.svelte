<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Mushrooms } from "./Mushrooms";
  import { move_player, keyup, keydown, move_bullet, shoot } from "./Player";
  import {
    Centipede,
    type CENTIPEDE,
    move_centipedes,
    update_centipedes,
  } from "./Centipede";
  import type { GAME, MAP } from "./types";

  let container: HTMLDivElement;
  let size: number;
  let map_size = [16, 17];

  onMount(() => {
    console.log("test");
    createScene(container);
  });

  let game: GAME;
  let shooting = false;

  const swap_camera = (game: GAME) => {
    const camera = game.camera;
    if (game.player_data.follow) {
      game.player_data.follow = false;
      camera.position.set(7.5, -10, 15);
      camera.rotation.x = 0;
    } else {
      game.player_data.follow = true;
      camera.rotation.x = Math.PI / 2;
      camera.position.z = 1;
    }
  };

  export const fire = (event: KeyboardEvent) => {
    if (event.key !== " ") return;
    shooting = true;
  };

  const createScene = (container: HTMLDivElement) => {
    game = {
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
      renderer: new THREE.WebGLRenderer(),
      score: 0,
      map: {
        height: map_size[1],
        width: map_size[0],
        map: [],
        mushrooms: [],
      },
      player: new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
        })
      ),
      player_data: {
        pos: new THREE.Vector3(7, -map_size[1] - 2, 0),
        follow: false,
        limits: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 0,
        },
      },
      bullets: [],
      bullet_data: {
        alive: [],
        delay: 200,
        last_fired: Date.now(),
        speed: 0.2,
      },
      centipedes: [
        Centipede({
          direction: 1,
          length: 15,
          head: new THREE.Vector3(0, 0, 0),
        }),
      ],
      centipede_data: {
        to_remove: null,
        speed: 1,
        delay: 150,
        last_move: Date.now(),
      },
      frozen: false,
    };

    size = Math.min(container.offsetWidth, container.offsetHeight);

    game.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    game.camera.position.set(7.5, -10, 15);
    game.renderer.setSize(size, size);
    container.appendChild(game.renderer.domElement);
    game.player.position.set(7, -game.map.height - 2, 0);
    game.player_data.limits = {
      x1: 0,
      y1: -(game.map.height + 2),
      x2: game.map.width - 1,
      y2: -(game.map.height - 1),
    };

    const [game_map, mushrooms] = Mushrooms(game.map.width, game.map.height);
    game.map.map = game_map;
    game.map.mushrooms = mushrooms;

    game.scene.add(game.player);

    game.centipedes.forEach((cent) => {
      if (!cent.spheres) return;
      cent.spheres.forEach((sphere) => game.scene.add(sphere));
    });

    game.map.mushrooms.forEach((mushroom) => game.scene.add(mushroom));

    const light = new THREE.AmbientLight(0x444444, 10);
    light.position.set(0, 0, 0);
    game.scene.add(light);

    function animate() {
      if (shooting) {
        shooting = false;
        shoot(game);
      }

      game.player_data.pos = move_player(
        game.player,
        game.player_data.limits,
        0.1
      );
      if (game.player_data.follow) {
        game.camera.position.x = game.player_data.pos.x;
        game.camera.position.y = game.player_data.pos.y - 1;
      }

      move_bullet(game);
      game.bullets = game.bullets.filter((_, i) => game.bullet_data.alive[i]);
      game.bullet_data.alive = game.bullet_data.alive.filter((v) => v);

      update_centipedes(game);
      if (game.centipede_data.to_remove) game.centipede_data.to_remove = null;

      const time_since = Date.now() - game.centipede_data.last_move;
      if (time_since > game.centipede_data.delay && !game.frozen) {
        game.centipedes.forEach((cent) =>
          move_centipedes(game.centipede_data.speed, cent, game.map)
        );
        game.centipede_data.last_move = Date.now();
      }
      game.centipedes.filter((cent) => cent.spheres && cent.spheres.length > 0);
      game.renderer.render(game.scene, game.camera);
      requestAnimationFrame(animate);
    }

    animate();
  };
</script>

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
