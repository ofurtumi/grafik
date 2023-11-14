<script lang="ts">
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import { onMount } from "svelte";
  import { GUI } from "lil-gui";

  let container: HTMLDivElement;
  onMount(() => {
    create_scene(container);
  });

  let gravity = -0.01;
  let velocity = 0;
  const move_ball = (ball: THREE.Mesh) => {
    velocity += velocity > -0.5 ? gravity : 0;
    ball.position.y += velocity;
    if (ball.position.y < 0) {
      ball.position.y = 0;
      velocity *= -0.9;
    }
  };

  const lights = {
    shadow_size: 1024,
    light_1_intensity: 10,
    light_2_intensity: 10,
    light_1_color: 0xffffff,
    light_2_color: 0xffffff,
    light_1_x: 2,
    light_1_y: 3,
    light_1_z: 2,
    light_2_x: -2,
    light_2_y: 3,
    light_2_z: -2,
  };

  const create_scene = (container: HTMLDivElement) => {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(500, 500);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const square = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
      })
    );
    square.position.set(-2, 0, -2);
    square.castShadow = true;
    square.receiveShadow = true;
    scene.add(square);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshPhongMaterial({
        color: 0xff0000,
      })
    );
    ball.position.set(0, 5, 0);
    ball.castShadow = true;
    scene.add(ball);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshPhongMaterial({
        color: 0x008833,
        side: THREE.DoubleSide,
      })
    );
    plane.position.set(0, -0.4, 0);
    plane.rotation.x = Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const gui = new GUI();

    const light_1 = new THREE.PointLight(
      lights.light_1_color,
      lights.light_1_intensity
    );
    light_1.castShadow = true; // þessi ljósgjafi getur valdið skuggum
    light_1.shadow.needsUpdate = true;
    light_1.position.set(lights.light_1_x, lights.light_1_y, lights.light_1_z);
    light_1.shadow.mapSize.width = lights.shadow_size;
    light_1.shadow.mapSize.height = lights.shadow_size;
    scene.add(light_1);
    const helper_1 = new THREE.PointLightHelper(light_1, 0.1);
    scene.add(helper_1);

    const light_1_folder = gui.addFolder("Light 1");
    light_1_folder
      .add(lights, "light_1_intensity", 0, 100)
      .onChange((v: number) => {
        light_1.intensity = v;
      });

    light_1_folder
      .addColor(lights, "light_1_color")
      .onChange((v: number) => light_1.color.set(v));

    light_1_folder
      .add(lights, "light_1_x", -10, 10, 1)
      .onChange((v: number) => {
        light_1.position.x = v;
      });
    light_1_folder
      .add(lights, "light_1_y", -10, 10, 1)
      .onChange((v: number) => {
        light_1.position.y = v;
      });
    light_1_folder
      .add(lights, "light_1_z", -10, 10, 1)
      .onChange((v: number) => {
        light_1.position.z = v;
      });

    const light_2 = new THREE.PointLight(
      lights.light_1_color,
      lights.light_1_intensity
    );
    light_2.castShadow = true; // þessi ljósgjafi getur valdið skuggum
    light_2.shadow.needsUpdate = true;
    light_2.position.set(lights.light_2_x, lights.light_2_y, lights.light_2_z);
    light_2.shadow.mapSize.width = lights.shadow_size;
    light_2.shadow.mapSize.height = lights.shadow_size;
    scene.add(light_2);
    const helper_2 = new THREE.PointLightHelper(light_2, 0.1);
    scene.add(helper_2);

    const light_2_folder = gui.addFolder("Light 2");
    light_2_folder
      .add(lights, "light_2_intensity", 0, 100)
      .onChange((v: number) => {
        light_2.intensity = v;
      });

    light_2_folder
      .addColor(lights, "light_2_color")
      .onChange((v: number) => light_2.color.set(v));

    light_2_folder
      .add(lights, "light_2_x", -10, 10, 1)
      .onChange((v: number) => {
        light_2.position.x = v;
      });
    light_2_folder
      .add(lights, "light_2_y", -10, 10, 1)
      .onChange((v: number) => {
        light_2.position.y = v;
      });
    light_2_folder
      .add(lights, "light_2_z", -10, 10, 1)
      .onChange((v: number) => {
        light_2.position.z = v;
      });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    function animate() {
      controls.update();
      move_ball(ball);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  };
</script>

<div id="container" bind:this={container} />
<button on:click={() => (velocity += 0.3)}>Launch ball</button>
<div id="gui" />
