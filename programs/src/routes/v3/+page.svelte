<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Mushrooms } from "./Mushrooms";

  let container: HTMLDivElement;
  let size: number;

  const createScene = () => {
    size = Math.min(container.offsetWidth, container.offsetHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(7.5, -9, 15);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    const centipede_length = 10;
    const sphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x32ff00 });
    let spheres: THREE.Mesh[] = [];
    for (let i = 0; i < centipede_length; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(0, 0, 0);
      scene.add(sphere);
      spheres.push(sphere);
    }

    //Gardalfur
    const geometryAlfur = new THREE.SphereGeometry(1, 32, 32); //
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: false,
    });
    const sphereAlfur = new THREE.Mesh(geometryAlfur, material);
    sphereAlfur.position.set( 7,-17, 0);
    scene.add(sphereAlfur);

    const moveDistance = 0.1; // The distance the sphere moves each frame
    const keyState = {}; // Object to hold the state of arrow keys

    function keyDownHandler(event) {
      keyState[event.code] = true;
    }

    function keyUpHandler(event) {
      keyState[event.code] = false;
    }

    // Add event listeners
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    const [game_map, mushrooms] = Mushrooms();
    mushrooms.forEach((mushroom) => scene.add(mushroom));

    const light = new THREE.AmbientLight(0x444444, 10);
    light.position.set(0, 2, 2);
    scene.add(light);

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
      high: number
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

    function animate() {
      move_worm(1);

      // Hreyfa Álf
      if (keyState["ArrowUp"]) {
        sphereAlfur.position.y += moveDistance;
      }
      if (keyState["ArrowDown"]) {
        sphereAlfur.position.y -= moveDistance;
      }
      if (keyState["ArrowLeft"]) {
        sphereAlfur.position.x -= moveDistance;
      }
      if (keyState["ArrowRight"]) {
        sphereAlfur.position.x += moveDistance;
      }

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
