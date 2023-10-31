<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

  let container: HTMLDivElement;

  let movement = {
    left: false,
    right: false,
    forward: false,
    back: false,
    up: false,
    down: false,
  };

  const cubes = [];

  const createScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(500, 500);
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/flip-tumi.jpg");

    const loader = new OBJLoader();

    // load a resource
    loader.load(
      // resource URL
      "/avatar.obj",
      // called when resource is loaded
      function (object) {
        object.traverse((child)=>{
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
            color: 0xFFF32F
        })
            console.log("hæ");
          }
        })

        object.scale.set(0.01, 0.01, 0.01); // Scale by 0.1 in all directions

        object.position.y = -1;
        scene.add(object);
      },
      // called when loading is in progresses
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      }
    );

    for (let i = 0; i < 6; ++i) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 1),
        new THREE.MeshStandardMaterial({
          map: texture,
        })
      );
      cube.position.x = Math.sin(i) * 2;
      cube.position.z = Math.cos(i) * 2;

      scene.add(cube);
      cubes.push(cube);
    }

    const lightsource = new THREE.AmbientLight(0xff00ff, 2);
    scene.add(lightsource);
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshPhongMaterial({
        emissive: 0xff00ff,
      })
    );

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5).normalize();
  scene.add(directionalLight);

    scene.add(light);

    camera.position.z = 2;
    camera.position.y = 2;
    camera.rotation.x = -1;

    function animate() {
      if (movement.left) {
        lightsource.position.x -= 0.1;
        light.position.x -= 0.1;
      }
      if (movement.right) {
        lightsource.position.x += 0.1;
        light.position.x += 0.1;
      }
      if (movement.forward) {
        lightsource.position.z -= 0.1;
        light.position.z -= 0.1;
      }
      if (movement.back) {
        lightsource.position.z += 0.1;
        light.position.z += 0.1;
      }
      if (movement.up) {
        lightsource.position.y += 0.1;
        light.position.y += 0.1;
      }
      if (movement.down) {
        lightsource.position.y -= 0.1;
        light.position.y -= 0.1;
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
