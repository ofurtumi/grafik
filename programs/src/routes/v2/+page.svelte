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
    rotateZ,
    cross,
    dot,
    length,
    degrees,
    vec2,
    scalem,
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

  const keydown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      z_view -= 0.1;
    } else if (e.key === "ArrowDown") {
      z_view += 0.1;
    }
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

  // movement controls
  let movement = false; // Do we rotate?
  let rot_x = 0;
  let rot_y = 0;
  let origin_x: number;
  let origin_y: number;
  let z_view = 10.0;

  // fish specifics
  interface fish_pos {
    current: vector;
    direction: vector;
    tail: number;
    wag_offset: number;
    speed: number;
    color: vector;
    rot_x: number;
    rot_y: number;
  }

  const fish_data: fish_pos[] = new Array(30).fill(null).map(() => {
    return {
      current: vec3(0, 0, 0),
      direction: vec3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05
      ),
      speed: (Math.random() * 2 - 1) * 2,
      tail: 0,
      wag_offset: 10 * Math.random() - 5,
      color: vec3(Math.random(), Math.random(), Math.random()),
      rot_x: 0,
      rot_y: 0,
    };
  });

  // buffer init
  const num_body = 6;
  const num_tail = 3;
  const num_fins = 3;

  let modelview: WebGLUniformLocation | null;
  let projection: WebGLUniformLocation | null;
  let color_loc: WebGLUniformLocation | null;

  let vertex_buffer: WebGLBuffer | null;
  let box_buffer: WebGLBuffer | null;
  let vertex_pos: number | null;

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    // const [vertices, colors] = colorCube(0.5);
    const vertices = [
      // body
      vec4(-0.5, 0.0, 0.0, 1.0),
      vec4(0.2, 0.2, 0.0, 1.0),
      vec4(0.5, 0.0, 0.0, 1.0),
      vec4(0.5, 0.0, 0.0, 1.0),
      vec4(0.2, -0.15, 0.0, 1.0),
      vec4(-0.5, 0.0, 0.0, 1.0),
      // tail
      vec4(-0.5, 0.0, 0.0, 1.0),
      vec4(-0.65, 0.15, 0.0, 1.0),
      vec4(-0.65, -0.15, 0.0, 1.0),
      // fins
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

    let mv = lookAt(
      vec3(0.0, 0.0, z_view),
      vec3(0.0, 0.0, 0.0),
      vec3(0.0, 1.0, 0.0)
    );

    mv = mult(mv, rotateX(rot_x)) as matrix;
    mv = mult(mv, rotateY(rot_y)) as matrix;

    for (let id = 0; id < fish_data.length; id++) {
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
      if (v > 9.5 || v < -9.5) {
        fish_data[id].direction[i] = -fish_data[id].direction[i];
      }
    });

    fish_data[id].current = add(
      fish_data[id].current,
      scale(0.2, normalize(fish_data[id].direction))
    ) as vector;

    // "RANDOM"
    // fish_data[id].direction = add(
    //   fish_data[id].direction,
    //   vec3(1, 1, 2)
    // ) as vector;

    // RANDOM
    fish_data[id].direction = add(
      fish_data[id].direction,
      vec3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05
      )
    ) as vector;

    fish_data[id].direction = fish_data[id].direction as vector;

    const a = fish_data[id].current;
    const b = fish_data[id].direction;
    // console.log(degrees(Math.acos((dot(a, b) / length(a)) * length(b))));
    mat = translate(fish_data[id].current) as matrix;
    // mat = mult(
    //   mat,
    //   rotateY(degrees(Math.acos((dot(a, b) / length(a)) * length(b))))
    // ) as matrix;

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

    // gl.uniform4fv(color_loc, vec4(...stats.color, 1.0));
    // gl.uniformMatrix4fv(modelview, false, flatten(mv));
    // gl.drawArrays(gl.POINTS, 0, 1);

    // draw body
    gl.uniform4fv(color_loc, vec4(...stats.color, 1.0));
    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, num_body);

    // draw tail
    fish_data[id].tail += stats.wag_offset;
    let mv_tail = mult(mv, translate(vec3(-0.5, 0.0, 0.0))) as matrix;
    mv_tail = mult(mv_tail, rotateY(stats.tail)) as matrix;
    mv_tail = mult(mv_tail, translate(vec3(0.5, 0.0, 0.0))) as matrix;
    gl.uniformMatrix4fv(modelview, false, flatten(mv_tail));
    gl.drawArrays(gl.TRIANGLES, num_body, num_tail);

    // draw fins
    mv = mult(mv, translate(vec3(0.2, 0, 0))) as matrix;
    mv = mult(mv, rotateX(90 + 0.5 * stats.tail)) as matrix;
    gl.uniform4fv(color_loc, vec4(...stats.color.map((c) => c + 0.1), 1.0)); // aðeins að lýsa uggann
    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, num_body + num_tail, num_fins);

    mv = mult(mv, rotateX(-180 - stats.tail)) as matrix;
    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, num_body + num_tail, num_fins);
  };
</script>

<div
  on:mousedown|preventDefault={mousedown}
  on:mouseup|preventDefault={mouseup}
  on:mousemove|preventDefault={mousemove}
>
  <WebGl {vs} {fs} {buffer} {render} num={undefined} />
</div>

<svelte:window on:keydown={keydown} />
