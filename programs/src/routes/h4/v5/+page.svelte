<script lang="ts">
  import WebGl from "$lib/WebGL.svelte";
  import { colorCube } from "$lib/Helpers";
  import {
    flatten,
    mat4,
    mult,
    scalem,
    vec3,
    translate,
    rotateX,
    rotateY,
    type matrix,
    rotateZ,
  } from "$lib/MV";

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

  // vertex shader
  const vs = `
    attribute vec4 vPosition;
    attribute vec4 vColor;
    varying vec4 fColor;

    uniform mat4 rotation;

    void main() {
      fColor = vColor;
      gl_Position = rotation * vPosition;
    }
  `;

  // fragment shader
  const fs = `
    precision mediump float;
    varying vec4 fColor;

    void main() { gl_FragColor = fColor; }
  `;

  // movement controls
  let movement = false; // Do we rotate?
  let rot_x = 0;
  let rot_y = 0;
  let origin_x: number;
  let origin_y: number;
  let keydown = false;

  // astronomical controls
  let rotYear = 0;
  let rotDay = 0;
  let earthTilt = 23.5;
  let distance_offset = 0.0;
  let rotation_offset = 0.0;

  // buffer init
  const num_verts = 36;

  let u_rota: WebGLUniformLocation | null;

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

    u_rota = gl.getUniformLocation(prog, "rotation");
  };

  const render = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rotDay += 10.0;
    rotYear += 0.5 + rotation_offset;

    let mv = mat4();
    mv = mult(mv, rotateX(rot_x)) as matrix;
    mv = mult(mv, rotateY(rot_y)) as matrix;

    // back left leg
    // mv_c = mult(mv, translate(vec3(-0.45, -0.1, 0.35))) as matrix;
    let mv_star = mult(mv, scalem(vec3(0.5, 0.5, 0.5)));
    gl.uniformMatrix4fv(u_rota, false, flatten(mv_star));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);

    let mv_moon = mult(mv_star, rotateY(rotYear));
    mv_moon = mult(mv_moon, translate(vec3(1.8 + distance_offset, 0.0, 0.0)));
    mv_moon = mult(mv_moon, rotateZ(earthTilt));
    mv_moon = mult(mv_moon, rotateY(rotDay));
    mv_moon = mult(mv_moon, scalem(vec3(0.2, 0.2, 0.2)));
    gl.uniformMatrix4fv(u_rota, false, flatten(mv_moon));
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);

    window.requestAnimationFrame(() => render(gl));
  };

  const offset_change = (e: KeyboardEvent) => {
    if (keydown) return;
    if (e.key === "ArrowUp") {
      distance_offset += 0.1;
    } else if (e.key === "ArrowDown") {
      distance_offset -= 0.1;
    } else if (e.key === "ArrowLeft") {
      rotation_offset -= 0.5;
    } else if (e.key === "ArrowRight") {
      rotation_offset += 0.5;
    }

    keydown = true;
  };
</script>

<div
  on:mousedown|preventDefault={mousedown}
  on:mouseup|preventDefault={mouseup}
  on:mousemove|preventDefault={mousemove}
>
  <WebGl {vs} {fs} {buffer} {render} num={undefined} />
</div>

<svelte:window on:keydown={offset_change} on:keyup={() => (keydown = false)} />
