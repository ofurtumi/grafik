<script lang="ts">
  import WebGL from "$lib/WebGL.svelte";
  import { random_rgba, rand_between } from "$lib/Helpers";
  import { vec2, flatten, type vector } from "$lib/MV";

  let points: vector[] = [];
  const vShader = `
    attribute vec4 vPosition;

    void
    main()
    {
      gl_Position = vPosition;
    }`;

  const fShader = `
    precision mediump float;

    void
    main()
    {
      gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
    }`;

  const buffer_func = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    points = [
      vec2(-0.2, -0.8),
      vec2(-0.2, 0.4),
      vec2(0.2, -0.8),
      vec2(0.2, 0.4),
      vec2(-0.2, 0.4),
      vec2(0.8, 0.4),
      vec2(-0.8, 0.4),
      vec2(0.8, 0.8),
      vec2(-0.8, 0.8),
    ];

    let bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    if (!prog) {
      console.error("No program");
      return;
    }
    let vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
  };

  const render_function = (gl: WebGLRenderingContext) => {
    // gl.clearColor(1.0, 1.0, 1.0, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
  };
</script>

<WebGL
  vs={vShader}
  fs={fShader}
  render={render_function}
  buffer={buffer_func}
/>
