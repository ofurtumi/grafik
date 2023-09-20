<script lang="ts">
  import WebGl from "$lib/WebGL.svelte";
  import { add, flatten, mult, vec2, type vector } from "$lib/MV";
  import { rect_from_coords } from "$lib/Helpers";
  import Matrix from "$lib/Matrix.svelte";

  let vPosition: number;
  let colorLoc: WebGLUniformLocation | null;
  let locationLoc: WebGLUniformLocation | null;

  let cube_buffer: WebGLBuffer | null;
  let paddle_buffer: WebGLBuffer | null;

  // move box
  const start_direction = () => {
    return [Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05];
  };

  let max = 1.0;
  let [dx, dy] = start_direction();

  let ball_radius = 0.05;
  let ball_offset: vector = [0.0, 0.0];
  let ball_speed = 0.5;
  let warning = 1.0;

  let paddle_width = 0.3;
  let paddle_height = 0.05;
  let paddle_offset: vector = [0.0, -0.8];

  const vs = `
  uniform vec2 offset;
  attribute vec4 vPosition;

  void main()
  {
    vec4 t = vPosition;
    t.xy += offset;
    gl_Position = t;
  }`;

  const fs = `
  precision mediump float;

  uniform vec4 fColor;
  void
  main()
  {
    gl_FragColor = fColor;
  }`;

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    // kúlu buffer
    cube_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(rect_from_coords(0.0, 0.0, 0.05)),
      gl.STATIC_DRAW
    );

    // spaða buffer
    paddle_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, paddle_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(rect_from_coords(0.0, 0.0, paddle_width, 0.05)),
      gl.STATIC_DRAW
    );

    // athuga hvort shaders hafi verið settir rétt inn
    if (!prog) {
      console.error("No program");
      return;
    }

    // attributes
    vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    // uniforms
    colorLoc = gl.getUniformLocation(prog, "fColor");
    locationLoc = gl.getUniformLocation(prog, "offset");

    // velja upphafsstefnu
  };

  const move_ball = (gl: WebGLRenderingContext) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_buffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    if (warning < 1) warning += 0.01;
    gl.uniform4f(colorLoc, 1, warning, warning, 1.0);

    ball_offset[0] += dx * ball_speed;
    ball_offset[1] += dy * ball_speed;

    gl.uniform2fv(locationLoc, ball_offset);
  };

  const is_collision = () => {
    // walls
    if (Math.abs(ball_offset[0]) > max - 0.05) dx = -dx;
    if (Math.abs(ball_offset[1]) > max - 0.05) {
      dy = -dy;
      if (ball_offset[1] < 0) warning = 0.0;
    }

    if (
      ball_offset[0] + ball_radius > paddle_offset[0] - paddle_width &&
      ball_offset[0] - ball_radius < paddle_offset[0] + paddle_width &&
      ball_offset[1] - ball_radius < paddle_offset[1] + paddle_height &&
      ball_offset[1] + ball_radius > paddle_offset[1] - paddle_height
    )
      dy = -dy;
  };

  const render = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    is_collision();
    move_ball(gl);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.bindBuffer(gl.ARRAY_BUFFER, paddle_buffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorLoc, 0.8, 1.0, 0.8, 1.0);
    gl.uniform2fv(locationLoc, paddle_offset);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    window.requestAnimationFrame(() => render(gl));
  };

  const move = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "h") {
      if (paddle_offset[0] > -max + paddle_width) paddle_offset[0] -= 0.1;
    }
    if (e.key === "ArrowRight" || e.key === "l") {
      if (paddle_offset[0] < max - paddle_width) paddle_offset[0] += 0.1;
    }
  };
</script>

<h1><s>Break</s>out</h1>
<WebGl {vs} {fs} {buffer} {render} num={undefined} />

<div class="flex column">
  <input type="range" max="1.0" min="0.0" step="0.1" bind:value={ball_speed} />
  <h2>Hraði: {ball_speed}</h2>
</div>

<div class="flex">
  <button
    on:click={() => {
      [dx, dy] = start_direction();
    }}>Nýr stefnuvigur</button
  >
  <Matrix
    matrix={vec2(
      Number(Math.abs(dx.toFixed(6))),
      Number(Math.abs(dy.toFixed(6)))
    )}
    dimension={4}
  />
</div>

<svelte:window on:keydown|preventDefault={move} />
