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
  } from "$lib/MV";
  import WebGl from "$lib/WebGL.svelte";

  // movement controls
  let movement = false; // Do we rotate?
  let rot_x = 15;
  let rot_y = 45;
  let origin_x: number;
  let origin_y: number;
  let z_view = 20;

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

  const keydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      z_view -= 0.1;
    } else if (e.key === "ArrowDown") {
      z_view += 0.1;
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

  // Parameters controlling the size of the Robot's arm

  let BASE_HEIGHT = 2.0;
  let BASE_WIDTH = 5.0;
  let LOWER_ARM_HEIGHT = 5.0;
  let LOWER_ARM_WIDTH = 1.0;
  let UPPER_ARM_HEIGHT = 5.0;
  let UPPER_ARM_WIDTH = 0.75;
  let HAND_HEIGHT = 2.0;
  let HAND_WIDTH = 0.5;

  // stillingar
  let Base = 0;
  let LowerArm = 1;
  let UpperArm = 2;
  let Hand = 3;
  let theta = [180, 0, 0, 0];
  let angle = 0;

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

    mvm = mult(mv, rotateY(theta[Base])) as matrix;
    base(gl);

    mvm = mult(mvm, translate(vec3(0.0, BASE_HEIGHT, 0.0))) as matrix;
    mvm = mult(mvm, rotateZ(clampTheta(theta[LowerArm], 80))) as matrix;
    lowerArm(gl);

    mvm = mult(mvm, translate(vec3(0.0, LOWER_ARM_HEIGHT, 0.0))) as matrix;
    mvm = mult(mvm, rotateZ(clampTheta(theta[UpperArm], 135))) as matrix;
    upperArm(gl);

    mvm = mult(mvm, translate(vec3(0.0, UPPER_ARM_HEIGHT, 0.0))) as matrix;
    mvm = mult(mvm, rotateZ(clampTheta(theta[Hand], 150))) as matrix;
    hand(gl);
    window.requestAnimationFrame(() => render(gl));
  };

  const base = (gl: WebGLRenderingContext) => {
    let s = scalem(vec3(BASE_WIDTH, BASE_HEIGHT, BASE_WIDTH));
    let instanceMatrix = mult(translate(vec3(0.0, 0.5 * BASE_HEIGHT, 0.0)), s);
    let t = mult(mvm, instanceMatrix) as matrix;
    gl.uniformMatrix4fv(mvm_loc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);
  };

  const upperArm = (gl: WebGLRenderingContext) => {
    let s = scalem(vec3(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH));
    let instanceMatrix = mult(
      translate(vec3(0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0)),
      s
    );
    let t = mult(mvm, instanceMatrix);
    gl.uniformMatrix4fv(mvm_loc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);
  };

  const lowerArm = (gl: WebGLRenderingContext) => {
    let s = scalem(vec3(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH));
    let instanceMatrix = mult(
      translate(vec3(0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0)),
      s
    );
    let t = mult(mvm, instanceMatrix);
    gl.uniformMatrix4fv(mvm_loc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);
  };

  const hand = (gl: WebGLRenderingContext) => {
    let s = scalem(vec3(HAND_WIDTH, HAND_HEIGHT, HAND_WIDTH));
    let instanceMatrix = mult(translate(vec3(0.0, 0.5 * HAND_HEIGHT, 0.0)), s);
    let t = mult(mvm, instanceMatrix);
    gl.uniformMatrix4fv(mvm_loc, false, flatten(t));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);
  };

  const clampTheta = (t: number, c: number) => {
    if (Math.abs(t) > c) {
      return Math.sign(t) * c;
    }
    return t;
  };
</script>

<div
  on:mousedown|preventDefault={mousedown}
  on:mouseup|preventDefault={mouseup}
  on:mousemove|preventDefault={mousemove}
  on:wheel={mousescroll}
>
  <WebGl {vs} {fs} {buffer} {render} num={undefined} />
</div>

<h2>Skilgreinum snúning á útlimum á eftirfarandi hátt:</h2>
<h3>input snúningur:raunverulegur snúningur</h3>

<input id="base" type="range" min="0" max="360" bind:value={theta[0]} />
<label for="base">Grunnur, {theta[0]}:{theta[0]}</label>

<input id="lower" type="range" min="-180" max="180" bind:value={theta[1]} />
<label for="lower">Neðri, {theta[1]}:{clampTheta(theta[1], 90)}</label>

<input id="upper" type="range" min="-140" max="140" bind:value={theta[2]} />
<label for="upper">Efri, {theta[2]}:{clampTheta(theta[2], 140)}</label>

<input id="hand" type="range" min="-180" max="180" bind:value={theta[3]} />
<label for="hand">Armur, {theta[3]}:{clampTheta(theta[3], 150)}</label>
