<script lang="ts">
  import WebGl from "$lib/WebGL.svelte";
  import { vec2, flatten, mix, type vector } from "$lib/MV";

  let points: vector[] = [];
  let n = 3;

  const divideSquare = (middle: vector, radius: number, count: number) => {
    if (count === 0) {
      points.push(...square(middle, radius));
    } else {
      // teikna miðju fyrir endurkvæmt skref
      points.push(...square(middle, radius));
      --count;

      // prettier-ignore
      {
        divideSquare(vec2(middle[0] - radius * 2, middle[1]), radius / 3, count);
        divideSquare(vec2(middle[0] + radius * 2, middle[1]), radius / 3, count);
        divideSquare(vec2(middle[0], middle[1] + radius * 2), radius / 3, count);
        divideSquare(vec2(middle[0], middle[1] - radius * 2), radius / 3, count);
        divideSquare(vec2(middle[0] - radius * 2, middle[1] - radius * 2), radius / 3, count);
        divideSquare(vec2(middle[0] + radius * 2, middle[1] + radius * 2), radius / 3, count);
        divideSquare(vec2(middle[0] - radius * 2, middle[1] + radius * 2), radius / 3, count);
        divideSquare(vec2(middle[0] + radius * 2, middle[1] - radius * 2), radius / 3, count);
      }
    }
  };

  const square = (middle: vector, radius: number) => {
    return [
      vec2(middle[0] - radius, middle[1] - radius),
      vec2(middle[0] - radius, middle[1] + radius),
      vec2(middle[0] + radius, middle[1] + radius),
      vec2(middle[0] + radius, middle[1] - radius),
    ];
  };

  const vShader = `
    attribute vec4 vPosition;
    uniform vec2 offset;

    void
    main() {
      gl_Position = vPosition;
    }`;

  const fShader = `
    precision mediump float;

    void
    main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`;

  const bFunc = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    let bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, 5 * Math.pow(8, 8), gl.STATIC_DRAW);

    if (!prog) {
      console.error("No program");
      return;
    }
    let vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
  };

  const rFunc = (gl: WebGLRenderingContext) => {
    points = [];
    divideSquare(vec2(0, 0), 1 / 3, n);

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let i = 0; i < points.length; i += 4) {
      gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
    }

    points = [];
  };
</script>

<div>
  <WebGl vs={vShader} fs={fShader} buffer={bFunc} render={rFunc} bind:num={n} />
  <input type="range" min="0" max="6" bind:value={n} />
  <h3>Dýpt á endurkvæmni: {n + 1}</h3>
</div>

<style>
  div {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1em;
    align-items: center;

    justify-content: center;
  }
</style>
