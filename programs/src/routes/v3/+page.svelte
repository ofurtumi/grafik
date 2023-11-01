<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Sigga } from "./sigga";

  let container: HTMLDivElement;

  let movement = {
    left: false,
    right: false,
    forward: false,
    back: false,
    up: false,
    down: false,
  };

  const createScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    let sigga: THREE.Group<THREE.Object3DEventMap>;
    Sigga({
      func: (obj) => {
        obj.scale.set(0.05, 0.05, 0.05);
        obj.position.set(0, -1, -1);
        sigga = obj;
        scene.add(obj);
      },
    });

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const light = new THREE.PointLight(0x444444, 10);
    light.position.set(0, 2, 2);
    const light_helper = new THREE.PointLightHelper(light);
    scene.add(light);
    scene.add(light_helper);

    function animate() {
      if (movement.left) {
        camera.position.x -= 0.1;
      }
      if (movement.right) {
        camera.position.x += 0.1;
      }
      if (movement.forward) {
        camera.position.z -= 0.1;
      }
      if (movement.back) {
        camera.position.z += 0.1;
      }
      if (movement.up) {
        camera.position.y += 0.1;
      }
      if (movement.down) {
        camera.position.y -= 0.1;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  };

  onMount(createScene);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "a") movement.left = true;
    if (e.key.toLowerCase() === "d") movement.right = true;
    if (e.key.toLowerCase() === "w") movement.forward = true;
    if (e.key.toLowerCase() === "s") movement.back = true;
    if (e.key.toLowerCase() === " ") movement.up = true;
    if (e.key === "Shift") movement.down = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "a") movement.left = false;
    if (e.key.toLowerCase() === "d") movement.right = false;
    if (e.key.toLowerCase() === "w") movement.forward = false;
    if (e.key.toLowerCase() === "s") movement.back = false;
    if (e.key.toLowerCase() === " ") movement.up = false;
    if (e.key === "Shift") movement.down = false;
  };
</script>

<div id="container" bind:this={container} />

<svelte:window on:keydown={handleKeyDown} on:keyup={handleKeyUp} />

<style>
  #container {
    width: 100%;
    height: 100%;
  }
</style>
