<script lang="ts">
  import { vec2, flatten } from "$lib/MV";
  import { sleep } from "$lib/Helpers";
  import WebGl from "$lib/WebGL.svelte";

  const vs = `
    attribute vec4 vPosition;

    void
    main()
    {
      gl_Position = vPosition;
    }`;

  const fs = `
    precision mediump float;
    uniform float time;

    void
    main()
    {
      gl_FragColor = vec4( sin(time), cos(time), tan(time), 1.0 );
    }`;

  let u_time: WebGLUniformLocation | null;

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    let triangle = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];

    let bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW);

    if (!prog) {
      console.error("No program");
      return;
    }

    let vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    u_time = gl.getUniformLocation(prog, "time");
  };

  const render = async (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(u_time, performance.now());
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);

    await sleep(1000);
    window.requestAnimationFrame(() => render(gl));
  };
</script>

<h1>Diskó þríhyrningur</h1>
<WebGl {vs} {fs} {buffer} {render} num={undefined} />

<div>
  <p>
    Bútalitarinn nýtir sér hornafræðiföllin, sin, cos og tan, ásamt uniform
    breytu "time" sem inniheldur núverandi tíma til þess að reikna út "random"
    lit
  </p>
  <pre>gl_FragColor = vec4( sin(time), cos(time), tan(time), 1.0 );<pre />
</pre>
</div>

<style>
  div {
    max-width: 500px;
    display: flex;
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }
</style>
