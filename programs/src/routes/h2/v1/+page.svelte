<script lang="ts">
  import WebGL from "$lib/WebGL.svelte";
  import { random_rgba, rand_between } from "$lib/Helpers";
  import { vec2, flatten, add, scale, type vector } from "$lib/MV";

  let points: vector[] = [];
  const NumPoints = 100;
  const vShader = `
    attribute vec4 vPosition;

    void
    main()
    {
      gl_PointSize = 3.0;
      gl_Position = vPosition;
    }`;

  const fShader = `
    precision mediump float;

    void
    main()
    {
      gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );
    }`;

  const buffer_func = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    let vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)];

    // Specify a starting point p for our iterations
    // p must lie inside any set of three vertices

    let u = add(vec2(100, 100), vec2(200, 200));
    let v = add(vec2(100, 100), vec2(200, 200));
    let p = scale(5, add(u, v));

    // And, add our initial point into our array of points

    points = [p];

    // Compute new points
    // Each new point is located midway between
    // last point and a randomly chosen vertex

    for (let i = 0; points.length < NumPoints; ++i) {
      let j = Math.floor(Math.random() * 3);
      p = add(points[i], vertices[j]);
      p = scale(0.5, p);
      points.push(p);
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
  };

  const render_function = (gl: WebGLRenderingContext) => {
    // gl.clearColor(1.0, 1.0, 1.0, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length);
  };
</script>

<WebGL
  vs={vShader}
  fs={fShader}
  render={render_function}
  buffer={buffer_func}
/>
