<script lang="ts">
  import { colorCube } from "$lib/Helpers";
  import {
    flatten,
    mat4,
    mult,
    rotateX,
    rotateY,
    type matrix,
    translate,
    vec3,
    scalem,
    perspective,
    lookAt,
    rotateZ,
    radians,
  } from "$lib/MV";
  import WebGl from "$lib/WebGL.svelte";

  // movement controls
  let movement = false; // Do we rotate?
  let rot_x = 0;
  let rot_y = 0;
  let origin_x: number;
  let origin_y: number;
  let z_view = 20;
  let num_arms = 2;
  let arm_length = 5;
  let rotations = [0, 0, 0, 0, 0].map(() => Math.random() * 360);
  let speed_offset = [0, 0, 0, 0, 0].map(() => 1 + Math.random() * 2);
  let theta = [90, 90, 90, 90, 90];
  let swing_speed = 2;

  // buffer init
  const num_verts = 36;

  // controls
  const mousedown = (e: MouseEvent) => {
    movement = true;
    origin_x = e.offsetX;
    origin_y = e.offsetY;
  };

  const mouseup = () => {
    movement = false;
  };

  const mousemove = (e: MouseEvent) => {
    if (movement) {
      rot_y = (rot_y + (origin_x - e.offsetX)) % 360;
      rot_x = (rot_x + (origin_y - e.offsetY)) % 360;
      origin_x = e.offsetX;
      origin_y = e.offsetY;
    }
  };

  const mousescroll = (e: WheelEvent) => {
    z_view += e.deltaY * 0.01;
  };

  // vertex shader
  const vs = `
    attribute vec4 vPosition;
    attribute vec4 vColor;
    varying vec4 fColor;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
      fColor = vColor;
      gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    }
  `;

  // fragment shader
  const fs = `
    precision mediump float;
    varying vec4 fColor;

    void main() { gl_FragColor = fColor; }
  `;

  let mvm: matrix;
  let mvm_loc: WebGLUniformLocation | null;
  let prm_loc: WebGLUniformLocation | null;

  let vertex_buffer: WebGLBuffer | null;
  let vertex_pos: number | null;

  let color_buffer: WebGLBuffer | null;
  let color_loc: number | null;

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    const [vertices, colors] = colorCube(0.5);

    // typechecking
    if (!prog) {
      console.error("No program");
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    color_loc = gl.getAttribLocation(prog, "vColor");
    gl.vertexAttribPointer(color_loc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color_loc);

    vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vertex_pos = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vertex_pos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertex_pos);

    if (!prog) {
      console.error("No program");
      return;
    }

    mvm_loc = gl.getUniformLocation(prog, "modelViewMatrix");
    prm_loc = gl.getUniformLocation(prog, "projectionMatrix");
    gl.uniformMatrix4fv(
      prm_loc,
      false,
      flatten(perspective(60, 1, 0.1, 100.0))
    );
  };

  const render = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let mv = lookAt(
      vec3(0.0, 2.0, z_view),
      vec3(0.0, 2.0, 0.0),
      vec3(0.0, 1.0, 0.0)
    );
    mv = mult(mv, rotateX(rot_x)) as matrix;
    mv = mult(mv, rotateY(rot_y)) as matrix;

    // mvm = mult(mv, rotateY(theta[Base])) as matrix;
    mvm = mult(mv, translate(vec3(0.0, 15, 0.0))) as matrix;

    for (let i = 0; i < num_arms; ++i) {
      let length = arm_length;
      mvm = arm(
        gl,
        mvm,
        { x: 0.5, y: length, z: 0.5 },
        length,
        Math.sin(radians((rotations[i] += swing_speed * speed_offset[i]))) *
          theta[i]
      );
    }

    window.requestAnimationFrame(() => render(gl));
  };

  const arm = (
    gl: WebGLRenderingContext,
    proj: matrix,
    scale: { x: number; y: number; z: number },
    offset: number,
    rotation: number
  ) => {
    let mv = mult(proj, translate(vec3(0.0, -offset, 0.0))) as matrix;
    let rot = mult(mv, rotateZ(rotation)) as matrix;
    let s = scalem(vec3(scale.x, scale.y, scale.z));
    let i = mult(translate(vec3(0.0, -0.5 * scale.y, 0.0)), s);
    let t = mult(rot, i);

    gl.uniformMatrix4fv(mvm_loc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);

    return rot;
  };
</script>

<div
  on:mousedown|preventDefault={mousedown}
  on:mouseup|preventDefault={mouseup}
  on:mousemove|preventDefault={mousemove}
  on:wheel={mousescroll}
>
  <WebGl {vs} {fs} {buffer} {render} />
</div>

<h2>Skilgreinum snúning á útlimum á eftirfarandi hátt:</h2>
<h3>input snúningur:raunverulegur snúningur</h3>

<input id="t0" type="range" min="1" max="175" bind:value={theta[0]} />
<label for="t0">
  Theta 0: {theta[0]}
</label>

<input id="t0" type="range" min="1" max="175" bind:value={theta[1]} />
<label for="t0">
  Theta 0: {theta[1]}
</label>

<input id="base" type="range" min="1" max="5" bind:value={num_arms} />
<label for="base">Fjöldi arma: {num_arms}</label>

<input
  id="base"
  type="range"
  min="1"
  max="3"
  step="0.5"
  bind:value={swing_speed}
/>
<label for="base">Hraði sveiflu: {swing_speed}</label>

<input id="length" type="range" min="1" max="10" bind:value={arm_length} />
<label for="length">Lengd arma: {arm_length}</label>
