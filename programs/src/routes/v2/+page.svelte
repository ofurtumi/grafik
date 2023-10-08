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
    rotateAll,
    degrees,
    normalize,
    add,
    scale,
  } from "$lib/MV";
  import { sleep } from "$lib/Helpers";

  // controls
  const mousedown = (e: MouseEvent) => {
    movement = true;
    origin_x = e.offsetX;
    origin_y = e.offsetY;
  };

  const bases = [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1)];

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
    speed: number;
  }

  let offset = 0.0;

  const fish_pos: fish_pos[] = new Array(30).fill(null).map((fish, id) => {
    return {
      current: vec3(0, 0, 0),
      direction: vec3(
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05,
        Math.random() * 0.1 - 0.05
      ),
      speed: Math.random() * 0.1 - 0.05,
      tail: 0,
    };
  });

  // buffer init
  const NumVertices = 9;
  const num_body = 6;
  const num_tail = 3;

  let modelview: WebGLUniformLocation | null;
  let projection: WebGLUniformLocation | null;
  let color_loc: WebGLUniformLocation | null;

  let vertex_buffer: WebGLBuffer | null;
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
    ];

    // typechecking
    if (!prog) {
      console.error("No program");
      return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vertex_pos = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vertex_pos, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertex_pos);

    if (!prog) {
      console.error("No program");
      return;
    }

    color_loc = gl.getUniformLocation(prog, "fColor");
    modelview = gl.getUniformLocation(prog, "modelview");
    projection = gl.getUniformLocation(prog, "projection");

    let proj = perspective(90.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv(projection, false, flatten(proj));
  };

  const render = async (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let mv = lookAt(
      vec3(0.0, 0.0, z_view),
      vec3(0.0, 0.0, 0.0),
      vec3(0.0, 1.0, 0.0)
    );

    mv = mult(mv, rotateX(rot_x)) as matrix;
    mv = mult(mv, rotateY(rot_y)) as matrix;

    for (let id = 0; id < fish_pos.length; id++) {
      fish(id, gl, mv, move_fish);
    }

    window.requestAnimationFrame(() => render(gl));
  };

  const move_fish = (id: number) => {
    let mat = mat4();

    fish_pos[id].current.map((v, i) => {
      if (v > 10.0 || v < -10.0) {
        fish_pos[id].direction[i] *= -1;
      }
    });

    fish_pos[id].current = add(
      fish_pos[id].current,
      fish_pos[id].direction
    ) as vector;

    fish_pos[id].direction = scale(
      0.1,
      add(
        normalize(fish_pos[id].direction),
        vec3(
          Math.random() * 0.1 - 0.05,
          Math.random() * 0.1 - 0.05,
          Math.random() * 0.1 - 0.05
        )
      ) as vector
    ) as vector;

    mat = translate(fish_pos[id].current) as matrix;

    return mat;
  };

  const fish = (
    id: number,
    gl: WebGLRenderingContext,
    mv: matrix,
    proj: (id: number) => matrix
  ) => {
    const stats = fish_pos[id];
    mv = mult(mv, proj(id)) as matrix;

    gl.uniform4fv(color_loc, vec4(1.0, 1.0, 1.0, 1.0));

    // draw body
    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, 0, num_body);

    // draw tail
    if (stats.tail > 35.0 || stats.tail < -35.0) {
      stats.tail += stats.speed;
    } else {
      stats.tail -= stats.speed;
    }
    mv = mult(mv, translate(vec3(-0.5, 0.0, 0.0))) as matrix;
    mv = mult(mv, rotateY(stats.tail)) as matrix;
    mv = mult(mv, translate(vec3(0.5, 0.0, 0.0))) as matrix;

    gl.uniformMatrix4fv(modelview, false, flatten(mv));
    gl.drawArrays(gl.TRIANGLES, num_body, num_tail);
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
