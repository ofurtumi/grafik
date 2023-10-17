<script lang="ts">
  import { vec2, flatten, type vector } from "$lib/MV";
  import WebGl from "$lib/WebGL.svelte";

  const vs = `
    #define CA_PI 3.1415;
    uniform float time;
    attribute vec4 vPosition;
    varying vec4 v_color;

    void main()
    {
      gl_PointSize = 3.0;
      vec4 tpos = vPosition; 

      tpos.y = 1.0 - mod(0.0015*time + tpos.y+1.0, 2.0);

      v_color = vec4(0,0,1,1);

      if (tpos.y < 0.3 && tpos.y > -0.3 || tpos.x < 0.3 && tpos.x > -0.3) {
        v_color.xyz = vec3(1,1,1);
        if (tpos.y < 0.1 && tpos.y > -0.1 || tpos.x < 0.1 && tpos.x > -0.1) {
          v_color.xyz = vec3(1,0,0);
        }
      }

      gl_Position = tpos;
    }`;

  const fs = `
    precision mediump float;
    varying vec4 v_color;

    void
    main()
    {
      gl_FragColor = v_color;
    }`;

  let points: vector[] = [];
  const num_points = 5000;
  let locTime: WebGLUniformLocation | null = null;

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    for (let i = 0; i < num_points; ++i) {
      let pt = vec2(2.0 * Math.random() - 1.0, 2.0 * Math.random() - 1.0);
      points.push(pt);
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
    locTime = gl.getUniformLocation(prog, "time");
  };

  const render = async (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(locTime, performance.now());
    gl.drawArrays(gl.POINTS, 0, num_points);

    window.requestAnimationFrame(() => render(gl));
  };
</script>

<h1>Íslenski fáninn</h1>
<WebGl {vs} {fs} {buffer} {render}  />
<p>Hnútalitarinn litar hnúta 😎, útfrá staðsetningu þeirra á striganum</p>
