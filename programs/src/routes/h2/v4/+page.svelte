<script lang="ts">
  import WebGL from "$lib/WebGL.svelte";
  import { random_rgba, rand_between } from "$lib/Helpers";
  import { vec2, flatten, type vector } from "$lib/MV";

  let points: vector[] = [];
  let colorLoc: WebGLUniformLocation | null;
  let offset: WebGLUniformLocation | null;
  const vShader = `
    attribute vec4 vPosition;
    uniform vec2 offset;

    void
    main() {
      gl_PointSize = 10.0;
      gl_Position = vec4(vPosition.xy + offset, 0.0, 1.0);
    }`;

  const fShader = `
    precision mediump float;
    uniform vec4 randColor;

    void
    main() {
      gl_FragColor = randColor;
    }`;

  const buffer_func = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    for (let i = 0; i < 100; i++) {
      points.push(...[vec2(0.0, 0.1), vec2(-0.1, -0.1), vec2(0.1, -0.1)]);
    }

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
    colorLoc = gl.getUniformLocation(prog, "randColor");
    offset = gl.getUniformLocation(prog, "offset");
  };

  const render_function = (gl: WebGLRenderingContext) => {
    // gl.clearColor(1.0, 1.0, 1.0, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < points.length; i += 3) {
      gl.uniform4fv(colorLoc, random_rgba());
      gl.uniform2fv(offset, vec2(rand_between(-1, 1), rand_between(-1, 1)));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
</script>

<WebGL
  vs={vShader}
  fs={fShader}
  render={render_function}
  buffer={buffer_func}
/>
