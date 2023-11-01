<script lang="ts">
  import { onMount } from "svelte";
  import * as THREE from "three";
  import { Sigga } from "./sigga";

  let container: HTMLDivElement;

  const createScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    camera.position.set(0,2,10)

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    let sigga: THREE.Group<THREE.Object3DEventMap>;
    Sigga({
      func: (obj) => {
        obj.scale.set(0.005, 0.005, 0.005);
        obj.position.set(0, -1, -1);
        sigga = obj;
        scene.add(obj);
      },
    });

    const sphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 0x32ff00 });
    let spheres: THREE.Mesh[] = [];

    const numSpheres = 10;
    for (let i = 0; i < numSpheres; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      // sphere.scale.set(0.5, 0.5, 0.5);
      sphere.position.set(-7.5, 10, 0);
      scene.add(sphere);
      spheres.push(sphere);
    }

    const light = new THREE.AmbientLight(0x444444, 10);
    light.position.set(0, 2, 2);
    scene.add(light);

    const speed = 0.05;
    console.log(spheres);
    let head_multiplier = 1;
    let down_movement = 0;
    let travel = 0;

    function animate() {
      if (travel >= 15) {
        head_multiplier *= -1;
        down_movement += -1;
        travel = 0;
      }
      if (spheres.at(-1) === undefined) return
      if (down_movement !== 0) {
          spheres.at(-1).position.y += down_movement;
          down_movement = 0;
      } else {
        spheres.at(-1).position.x += head_multiplier * speed;
        travel += speed;
      }

      for (let i = spheres.length - 2; i >= 0; i--) {
        const currentSphere = spheres[i];
        const targetSphere = spheres[i + 1];

        const dx = targetSphere.position.x - currentSphere.position.x;
        const dy = targetSphere.position.y - currentSphere.position.y;

        currentSphere.position.x += dx * speed;
        currentSphere.position.y += dy * speed;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  };

  onMount(createScene);
</script>

<div id="container" bind:this={container} />

<style>
  #container {
    width: 100%;
    height: 100%;
  }
</style>
