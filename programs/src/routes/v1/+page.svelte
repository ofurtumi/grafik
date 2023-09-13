<script lang="ts">
  import WebGl from "$lib/WebGL.svelte";
  import { flatten, vec2, type vector } from "$lib/MV";
  import { tri_from_coords, rect, rect_from_coords } from "$lib/Helpers";
  import texts from "./texts.json";

  // Shader variables
  let offsetLoc: WebGLUniformLocation | null;
  let colorLoc: WebGLUniformLocation | null;
  let rotationLoc: WebGLUniformLocation | null;
  let vPosition: number;

  // Game variables
  const num_map = 3;
  const num_roads = 8;
  const num_car = 5;
  const cars: vector[] = [];
  let blood_pos: vector[] = [];
  $: death_count = 0;
  $: counter = 0;
  $: won = counter >= 10;

  // Player variables
  let offset = vec2(0, -0.95);
  let frozen = false;
  let rotation = 0;

  // Buffer initialization
  let mapBuffer: WebGLBuffer | null;
  let frogBuffer: WebGLBuffer | null;
  let carBuffer: WebGLBuffer | null;
  let pointBuffer: WebGLBuffer | null;
  let bloodBuffer: WebGLBuffer | null;

  const vShader = `
    attribute vec4 vPosition;
    uniform vec2 offset;
    uniform float rotation;


    void
    main() {
      gl_PointSize = 20.0;
      gl_Position = vec4(vPosition.xy + offset, 0.0, 1.0);
    }`;

  const fShader = `
    precision mediump float;
    uniform vec4 color;

    void
    main() {
      gl_FragColor = color;
    }`;

  const bFunc = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    cars.push(...rect(vec2(-0.1, 0.05), vec2(0.1, -0.05)));

    // create map-buffer
    let swamp = [
      ...rect(vec2(-1, -0.8), vec2(1, -1)),
      ...rect(vec2(-1, 0.8), vec2(1, 1)),
      ...rect(vec2(-1, 0.1), vec2(1, -0.1)),
    ];
    mapBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mapBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(swamp), gl.STATIC_DRAW);

    // create frog-buffer
    frogBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, frogBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(tri_from_coords(0, 0, 0.03)),
      gl.STATIC_DRAW
    );

    // create car-buffer
    carBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, carBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cars), gl.STATIC_DRAW);

    // create point-buffer
    pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(rect_from_coords(-0.98, -0.95, 0.005, 0.07)),
      gl.STATIC_DRAW
    );

    // create blood-buffer
    bloodBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bloodBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten([
        vec2(0.06, 0.02),
        vec2(0.01, 0.08),
        vec2(-0.08, 0.04),
        vec2(-0.06, -0.05),
        vec2(0.03, -0.05),
      ]),
      gl.STATIC_DRAW
    );

    // athuga hvort shaders hafi verið settir rétt inn
    if (!prog) {
      console.error("No program");
      return;
    }

    colorLoc = gl.getUniformLocation(prog, "color");
    offsetLoc = gl.getUniformLocation(prog, "offset");
    rotationLoc = gl.getUniformLocation(prog, "rotation");

    vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.enableVertexAttribArray(vPosition);
  };

  const move = (e: KeyboardEvent) => {
    if (frozen) {
      return;
    }
    if (e.code === "ArrowUp") {
      if (offset[1] < 0.95) offset[1] += 0.1;
      rotation = 0;
    }
    if (e.code === "ArrowRight") {
      if (offset[0] < 0.9) offset[0] += 0.1;
      rotation = 1;
    }
    if (e.code === "ArrowDown") {
      if (offset[1] > -0.95) offset[1] -= 0.1;
      rotation = 2;
    }
    if (e.code === "ArrowLeft") {
      if (offset[0] > -0.9) offset[0] -= 0.1;
      rotation = 3;
    }
    offset[0] = Math.round(offset[0] * 100) / 100;
    offset[1] = Math.round(offset[1] * 100) / 100;

    if (counter % 2 === 0 && offset[1] > 0.8) {
      counter += 1;
    } else if (counter % 2 === 1 && offset[1] < -0.8) {
      counter += 1;
    }

    frozen = true;
  };

  const rFunc = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    // blood 🩸
    gl.bindBuffer(gl.ARRAY_BUFFER, bloodBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLoc, 0.8, 0.0, 0.0, 1.0);
    blood_pos.forEach((pos) => {
      gl.uniform2f(offsetLoc, pos[0], pos[1]);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 5);
    });

    // background
    gl.bindBuffer(gl.ARRAY_BUFFER, mapBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(offsetLoc, 0.0, 0.0);
    gl.uniform4f(colorLoc, 0.4, 0.5, 0.2, 0.2);
    for (let i = 0; i < num_map; ++i) {
      gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
    }

    // frog
    gl.bindBuffer(gl.ARRAY_BUFFER, frogBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      flatten(tri_from_coords(offset[0], offset[1], 0.04, rotation))
    );

    gl.uniform4f(colorLoc, 0.1, 0.6, 0.0, 1.0);
    gl.uniform2f(offsetLoc, 0.0, 0.0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // cars
    gl.bindBuffer(gl.ARRAY_BUFFER, carBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    traffic(Date.now(), gl);

    // points
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLoc, 0.0, 0.0, 0.0, 1.0);
    for (let i = 0; i < counter; ++i) {
      gl.uniform2f(offsetLoc, i * 0.03, 0);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    window.requestAnimationFrame(() => rFunc(gl));
  };

  const traffic = (time: number, gl: WebGLRenderingContext) => {
    for (let section = 0; section < 2; ++section) {
      for (let road = 0; road < num_roads / 2; ++road) {
        gl.uniform4f(colorLoc, 0.6, 0.2 * road, 0.0 + 0.5 * section, 0.8);
        for (let car = 0; car < num_car; ++car) {
          const [x_off, y_off] = offsets(section, road, car, time);
          gl.uniform2f(offsetLoc, x_off, y_off);
          gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

          if (offset[1] < 0.05 + y_off && offset[1] > -0.05 + y_off) {
            if (offset[0] < 0.1 + x_off && offset[0] > -0.1 + x_off) {
              blood_pos.push(offset);
              death_count += 1;
              counter = 0;
              offset = vec2(0, -0.95);
            }
          }
        }
      }
    }
  };

  // prettier-ignore
  const offsets = (sect: number, road: number, car: number, time: number) => {
    let road_dir = sect % 2 === 0 ? 1 : -1;
    let car_dir = road % 2 === 0 ? 1 : -1;

    let x_off = won ? 0.0004 : 0; // increase speed of game is won
    x_off += 0.0002;              // base speed
    x_off += 0.0001 * road;       // road speed
    x_off -= 0.0001 * sect;       // section speed
    x_off *= time;                // global time, syncs all cars
    x_off -= car * 0.6;           // car spacing
    x_off += 0.5 * road;          // road spacing
    x_off %= 2.4;                 // loop road
    x_off -= 1.2;                 // center road
    x_off *= car_dir * road_dir;  // road and car direction

    let y_off = 0.2 * road; // road offset
    y_off += 0.1 * sect;    // car width offset
    y_off += 0.15;          // car top offset
    y_off -= sect;          // section offset

    return [x_off, y_off]
  };
</script>

{#if won}
  <h1>Þú vannst :)</h1>
  <h2>Kemstu lengra?</h2>
{:else if counter}
  <h1>{texts[counter - 1][0]}</h1>
  <h2>{texts[counter - 1][1]}</h2>
{:else if death_count}
  <h1>Þú dóst :(</h1>
  <h2>og hefur dáið {death_count} sinnum</h2>
{:else}
  <h1>Komdu þér yfir götuna!</h1>
  <h2>Hversu langt kemstu?</h2>
{/if}
<div>
  <WebGl
    vs={vShader}
    fs={fShader}
    buffer={bFunc}
    render={rFunc}
    num={undefined}
  />

  <h1>{counter}</h1>
</div>

<svelte:window
  on:keydown|preventDefault={move}
  on:keyup|preventDefault={() => {
    frozen = false;
  }}
/>

<style>
  div {
    display: flex;
    position: relative;
    z-index: 10;
    flex-direction: column;
    justify-content: start;
  }

  h1 {
    margin-left: 1rem;
  }
</style>
