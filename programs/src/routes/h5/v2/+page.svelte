<script lang="ts">
  import WebGl from "$lib/WebGL.svelte";
  import {
    flatten,
    mult,
    rotateX,
    rotateY,
    type matrix,
    vec4,
    perspective,
    lookAt,
    vec3,
    translate,
    type vector,
    mat4,
    normalize,
    add,
    scale,
    degrees,
    scalem,
    rotateZ,
    radians,
  } from "$lib/MV";

  // controls
  let movement = false; // Do we rotate?
  let origin_x: number;
  let player_dir = 0;
  let player_pos = vec3(0, 0, 0);
  let speed = 0.1;

  const mousedown = (e: MouseEvent) => {
    movement = true;
    origin_x = e.clientX;
  };

  const mouseup = () => {
    movement = false;
  };

  const mousemove = (e: MouseEvent) => {
    if (movement) {
      player_dir += 0.4 * (origin_x - e.clientX);
      player_dir %= 360.0;
      origin_x = e.clientX;
    }
  };

  const look = (p_dir: number) => {
    const player_x_dir = Math.cos(radians(p_dir));
    const player_y_dir = Math.sin(radians(p_dir));

    const [x, _, z] = player_pos;
    return lookAt(
      vec3(x, 0, z),
      vec3(x + player_x_dir, 0, z + player_y_dir),
      vec3(0.0, 1.0, 0.0)
    );
  };

  const keydown = (e: KeyboardEvent) => {
    const p_x_dir = Math.cos(radians(player_dir));
    const p_z_dir = Math.sin(radians(player_dir));

    switch (e.key) {
      case "w":
        player_pos = add(
          player_pos,
          vec3(p_x_dir * speed, 0, p_z_dir * speed)
        ) as vector;
        break;
      case "s":
        player_pos = add(
          player_pos,
          vec3(p_x_dir * -speed, 0, p_z_dir * -speed)
        ) as vector;
        break;
      case "a":
        player_pos = add(
          player_pos,
          vec3(p_z_dir * speed, 0, -p_x_dir * speed)
        ) as vector;
        break;
      case "d":
        player_pos = add(
          player_pos,
          vec3(-p_z_dir * speed, 0, p_x_dir * speed)
        ) as vector;
        break;
    }
  };

  const mousescroll = (e: WheelEvent) => {
    z_view += e.deltaY * 0.01;
  };

  // vertex shader
  const vs = `
    attribute vec4 vPosition;

    uniform mat4 projection;
    uniform mat4 modelview;

    void main() {
      gl_PointSize = 5.0;
      gl_Position = projection * modelview * vPosition;
    }
  `;

  // fragment shader
  const fs = `
    precision mediump float;

    uniform vec4 fColor;

    void main() { gl_FragColor = fColor; }
  `;

  // settings
  let z_view = 25.0;
  let num_fish = 20;
  let fish_scale = 1;
  let border = 10 - fish_scale * 0.3;
  let global_speed = 0.0;
  let wireframe = false;

  // fish specifics
  interface fish_pos {
    current: vector;
    direction: vector;
    tail: number;
    wag_offset: number;
    speed: number;
    color: vector;
  }

  const fish_data: fish_pos[] = new Array(500).fill(null).map(() => {
    return {
      current: vec3(
        Math.random() * 18 - 9,
        Math.random() * 18 - 9,
        Math.random() * 18 - 9
      ),
      direction: vec3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.05 - 0.025,
        Math.random() * 0.1 - 0.05
      ),
      speed: Math.random() * 0.2 + 0.1,
      tail: 0,
      wag_offset: 10 * Math.random() - 5,
      color: vec3(Math.random(), Math.random(), Math.random()),
    };
  });

  // buffer init
  const num_body = 17;
  const num_tail = 3;
  const num_fins = 3;

  let modelview: WebGLUniformLocation | null;
  let projection: WebGLUniformLocation | null;
  let color_loc: WebGLUniformLocation | null;

  let vertex_buffer: WebGLBuffer | null;
  let box_buffer: WebGLBuffer | null;
  let debug_buffer: WebGLBuffer | null;
  let vertex_pos: number | null;

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    const vertices = [
      vec4(-0.5, 0.0, 0.0, 1.0),
      vec4(0.2, 0.2, 0.0, 1.0),
      vec4(0.2, 0.0, -0.2, 1.0),
      vec4(0.5, 0.0, 0.0, 1.0),
      vec4(0.5, 0.0, 0.0, 1.0),
      vec4(0.2, 0.2, 0.0, 1.0),
      vec4(0.2, -0.2, 0.0, 1.0),
      vec4(-0.5, 0.0, 0.0, 1.0),
      vec4(0.2, -0.2, 0.0, 1.0),
      vec4(0.2, 0.0, -0.2, 1.0),
      vec4(-0.5, 0.0, 0.0, 1.0),
      vec4(0.2, 0.2, 0.0, 1.0),
      vec4(0.2, 0.0, 0.2, 1.0),
      vec4(0.5, 0.0, 0.0, 1.0),
      vec4(0.2, -0.2, 0.0, 1.0),
      vec4(0.2, 0.0, 0.2, 1.0),
      vec4(-0.5, 0.0, 0.0, 1.0),
      // sporður
      vec4(-0.5, 0.0, 0.0, 1.0),
      vec4(-0.65, 0.15, 0.0, 1.0),
      vec4(-0.65, -0.15, 0.0, 1.0),
      // uggi
      vec4(0.0, 0.0, 0.0, 1.0),
      vec4(0.1, 0.15, 0.0, 1.0),
      vec4(-0.1, 0.15, 0.0, 1.0),
    ];

    const box = [
      vec4(-10, 10, -10, 1.0),
      vec4(-10, -10, -10, 1.0),
      vec4(10, -10, -10, 1.0),
      vec4(10, 10, -10, 1.0),
      vec4(-10, 10, -10, 1.0),
      vec4(-10, 10, 10, 1.0),
      vec4(-10, -10, 10, 1.0),
      vec4(10, -10, 10, 1.0),
      vec4(10, 10, 10, 1.0),
      vec4(-10, 10, 10, 1.0),
      vec4(-10, -10, 10, 1.0),
      vec4(-10, -10, -10, 1.0),
      vec4(10, -10, -10, 1.0),
      vec4(10, -10, 10, 1.0),
      vec4(10, 10, 10, 1.0),
      vec4(10, 10, -10, 1.0),
    ];

    const debug = [vec4(-1, 0, 0, 1), vec4(1, 0, 0, 1)];

    // typechecking
    if (!prog) {
      console.error("No program");
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    box_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, box_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(box), gl.STATIC_DRAW);

    debug_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, debug_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(debug), gl.STATIC_DRAW);

    vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    if (!prog) {
      console.error("No program");
      return;
    }

    vertex_pos = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vertex_pos, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertex_pos);

    color_loc = gl.getUniformLocation(prog, "fColor");
    modelview = gl.getUniformLocation(prog, "modelview");
    projection = gl.getUniformLocation(prog, "projection");

    let proj = perspective(90.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv(projection, false, flatten(proj));
  };

  const render = async (gl: WebGLRenderingContext) => {
    if (!vertex_pos && vertex_pos !== 0) {
      console.error("No vertex pos");
      return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.vertexAttribPointer(vertex_pos, 4, gl.FLOAT, false, 0, 0);

    let mv = look(player_dir);

    for (let id = 0; id < num_fish; id++) {
      draw_fish(id, gl, mv, move_fish);
    }

    gl.uniform4fv(color_loc, vec4(1.0, 1.0, 1.0, 1.0));
    gl.bindBuffer(gl.ARRAY_BUFFER, box_buffer);
    gl.vertexAttribPointer(vertex_pos, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    gl.drawArrays(gl.LINE_STRIP, 0, 16);

    window.requestAnimationFrame(() => render(gl));
  };

  const move_fish = (id: number) => {
    let mat = mat4();

    fish_data[id].current.map((v, i) => {
      if (v >= border || v <= -border) {
        fish_data[id].current[i] = fish_data[id].current[i] * -0.9;
      }
    });

    fish_data[id].current = add(
      fish_data[id].current,
      scale(
        fish_data[id].speed * global_speed,
        normalize(fish_data[id].direction)
      )
    ) as vector;

    const [xd, _, zd] = normalize(fish_data[id].direction);
    const degZX = degrees(Math.atan2(zd, xd));

    fish_data[id].direction = fish_data[id].direction as vector;

    mat = mult(mat, translate(fish_data[id].current)) as matrix;
    mat = mult(mat, rotateY(-degZX)) as matrix;
    mat = mult(mat, scalem(vec3(fish_scale, fish_scale, fish_scale))) as matrix;

    return mat;
  };

  const draw_fish = (
    id: number,
    gl: WebGLRenderingContext,
    mv: matrix,
    proj: (id: number) => matrix
  ) => {
    mv = mult(mv, proj(id)) as matrix;

    // reverse tail
    let stats = fish_data[id];
    if (stats.tail > 35.0 || stats.tail < -35.0) {
      fish_data[id].wag_offset = -stats.wag_offset;
      stats = fish_data[id];
    }

    // draw body
    gl.uniform4fv(color_loc, vec4(...stats.color, 1.0));
    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    if (wireframe) {
      gl.drawArrays(gl.LINE_LOOP, 0, num_body);
    } else {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, num_body);
    }

    // lighten extremities
    gl.uniform4fv(color_loc, vec4(...stats.color.map((c) => c * 1.2), 1.0));

    // draw tail
    fish_data[id].tail += stats.wag_offset;
    let mv_tail = mult(mv, translate(vec3(-0.5, 0.0, 0.0))) as matrix;
    mv_tail = mult(mv_tail, rotateY(stats.tail)) as matrix;
    mv_tail = mult(mv_tail, translate(vec3(0.5, 0.0, 0.0))) as matrix;
    gl.uniformMatrix4fv(modelview, false, flatten(mv_tail));
    gl.drawArrays(gl.TRIANGLES, num_body, num_tail);

    // draw fins
    let mv_r = mult(mv, translate(vec3(0.2, 0, 0.2))) as matrix;
    mv_r = mult(mv_r, rotateZ(90)) as matrix;
    mv_r = mult(mv_r, rotateX(45 + 0.5 * stats.tail)) as matrix;
    gl.uniformMatrix4fv(modelview, false, flatten(mv_r));
    gl.drawArrays(gl.TRIANGLES, num_body + num_tail, num_fins);

    let mv_l = mult(mv, translate(vec3(0.2, 0, -0.2))) as matrix;
    mv_l = mult(mv_l, rotateZ(90)) as matrix;
    mv_l = mult(mv_l, rotateX(-45 - 0.5 * stats.tail)) as matrix;
    gl.uniformMatrix4fv(modelview, false, flatten(mv_l));
    gl.drawArrays(gl.TRIANGLES, num_body + num_tail, num_fins);
  };
</script>

<h1>3D Camera Controller</h1>
<h2>WASD til að hreyfa sig, mús til að breyta sjónarhorni</h2>
<div
  on:mousedown|preventDefault={mousedown}
  on:mouseup|preventDefault={mouseup}
  on:mousemove|preventDefault={mousemove}
  on:wheel={mousescroll}
>
  <WebGl {vs} {fs} {buffer} {render} />
</div>

<input
  id="player_dir"
  type="range"
  min="0.1"
  max="2.0"
  step="0.1"
  bind:value={speed}
/>
<label for="player_dir">Speed: {speed}</label>

<svelte:window on:keydown={keydown} />
