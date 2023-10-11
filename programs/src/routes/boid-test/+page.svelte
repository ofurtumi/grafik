<script lang="ts">
  import WebGl from "$lib/WebGL.svelte";
  import {
    add,
    distance,
    flatten,
    negate,
    normalize,
    scale,
    vec2,
    type vector,
  } from "$lib/MV";

  let vPosition: number;
  let colorLoc: WebGLUniformLocation | null;
  let locationLoc: WebGLUniformLocation | null;
  let rotLoc: WebGLUniformLocation | null;

  let point_buffer: WebGLBuffer | null;
  let arrow_buffer: WebGLBuffer | null;

  // move box
  const start_direction = () => {
    return vec2(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05);
  };

  let num_balls = 1;
  let speed = 1;
  $: ball_speed = speed * 0.01;
  let ball_radius = 0.1;
  let show_arrow = false;

  let ball_direction = new Array(500)
    .fill(null)
    .map((_) => normalize(start_direction()));
  let ball_locations = new Array(500).fill(null).map((_) =>
    start_direction().map((i) => {
      return i * 4;
    })
  );
  let ball_rotations = new Array(500).fill(null).map((_) => 0);

  const vs = `
  uniform vec2 offset;
  uniform float rot;
  attribute vec4 vPosition;

  void main()
  {
    gl_PointSize = 5.0;
    vec4 t = vPosition; 
    
    vec2 r = vec2(t.x*cos(rot) - t.y*sin(rot),t.x*sin(rot) + t.y*cos(rot));
    t.xy=r;
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
    point_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, point_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vec2(0, 0)), gl.STATIC_DRAW);

    arrow_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrow_buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten([vec2(0, 0), vec2(0.1, 0), vec2(0, 0)]),
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
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    // uniforms
    colorLoc = gl.getUniformLocation(prog, "fColor");
    locationLoc = gl.getUniformLocation(prog, "offset");
    rotLoc = gl.getUniformLocation(prog, "rot");
  };

  const render = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let i = 0; i < num_balls; ++i) {
      gl.bindBuffer(gl.ARRAY_BUFFER, point_buffer);
      gl.uniform4f(colorLoc, 1, 1, 1, 1);
      gl.uniform1f(rotLoc, 0);

      flock(i);
      const [dx, dy] = normalize(ball_direction[i]);
      ball_locations[i][0] += dx * ball_speed;
      ball_locations[i][1] += dy * ball_speed;
      let [cx, cy] = ball_locations[i];

      if (cx > 1.1 || cx < -1.1) {
        ball_locations[i][0] *= -1;
      }
      if (cy > 1.1 || cy < -1.1) {
        ball_locations[i][1] *= -1;
      }
      gl.uniform2fv(locationLoc, ball_locations[i]);
      gl.drawArrays(gl.POINTS, 0, 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, arrow_buffer);
      gl.uniform4f(colorLoc, 1, 0, 1, 1);

      if (show_arrow) {
        // rotate arrow
        [cx, cy] = ball_locations[i];
        ball_rotations[i] = Math.atan2(dy, dx);
        gl.uniform1f(rotLoc, ball_rotations[i]);

        gl.drawArrays(gl.LINES, 0, 2);
      }
    }
    window.requestAnimationFrame(() => render(gl));
  };

  const flock = (id: number) => {
    const current = scale(ball_speed, normalize(ball_locations[id]));
    const neighbors = ball_locations
      .slice(0, num_balls)
      .filter((d, i) => {
        if (i === id) return false;
        if (distance(current, d) <= ball_radius) {
          return true;
        }
        return false;
      })
      .map((d) => {
        return { dist: ball_radius - distance(current, d), loc: d };
      });

    if (neighbors.length === 0) return;

    let reverse = vec2(0, 0);
    neighbors.forEach((n: { dist: number; loc: vector }) => {
      reverse = add(reverse, scale(n.dist, n.loc)) as vector;
    });

    reverse.map((v) => {
      return v / neighbors.length;
    });

    reverse = negate(reverse);
    ball_direction[id] = add(reverse, ball_direction[id]) as vector;
  };
</script>

<WebGl {vs} {fs} {buffer} {render} num={undefined} />

<input id="num_balls" type="range" bind:value={num_balls} min="1" max="500" />
<label for="num_balls">Number of balls: {num_balls}</label>

<input
  id="ball_speed"
  type="range"
  bind:value={speed}
  min="0.5"
  max="5"
  step="0.1"
/>
<label for="num_balls">Ball speed: {speed}</label>

<input
  id="ball_radius"
  type="range"
  bind:value={ball_radius}
  min="0.1"
  max="0.3"
  step="0.05"
/>
<label for="ball_radius">Ball radius: {ball_radius}</label>

<input id="show_arrow" type="checkbox" bind:checked={show_arrow} />
<label for="show_arrow">Show arrow</label>
