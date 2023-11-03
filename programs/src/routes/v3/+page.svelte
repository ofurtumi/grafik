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
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    const centipede_length = 10;
    const sphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x32ff00 });
    let spheres: THREE.Mesh[] = [];
    for (let i = 0; i < centipede_length; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(-8, 8, 0);
      scene.add(sphere);
      spheres.push(sphere);
    }

    const [game_map, mushrooms] = Mushrooms();
    mushrooms.forEach((mushroom) => scene.add(mushroom));

    const light = new THREE.AmbientLight(0x444444, 10);
    light.position.set(0, 2, 2);
    scene.add(light);

    const speed = 0.5;
    let head_multiplier = 1;
    let wanted_height = 0;
    let current_height = 0;
    let current_width = 0;
    let back_up = false;
    let travel = 0;

    function animate() {
      if (travel >= 15) {
        if (current_height <= -15) {
          back_up = true;
        } else {
          travel = 0;
          head_multiplier *= -1;
          wanted_height -= 1;
        }
      }

      if (back_up) {
        spheres[0].position.y += speed;
        current_height = (current_height * 10 + speed * 10) / 10;
        if (current_height === 0) {
          back_up = false;
          wanted_height = 0;
          travel = 0;
        }
      } else if (wanted_height !== current_height) {
        console.log(game_map[Math.abs(current_height)]);
        spheres[0].position.y -= speed;
        current_height = (current_height * 10 - speed * 10) / 10;
      } else {
        spheres[0].position.x =
          (spheres[0].position.x * 10 + head_multiplier * speed * 10) / 10;
        travel += speed;
      }
      for (let i = 1; i < centipede_length; i++) {
        const currentSphere = spheres[i];
        const targetSphere = spheres[i - 1];

        const dx = targetSphere.position.x - currentSphere.position.x;
        const dy = targetSphere.position.y - currentSphere.position.y;

        currentSphere.position.x += dx * speed;
        currentSphere.position.y += dy * speed;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(() => setTimeout(animate, 0));
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
