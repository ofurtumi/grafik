<script lang="ts">
  import {
    flatten,
    lookAt,
    mult,
    perspective,
    radians,
    translate,
    vec2,
    vec3,
    vec4,
    type matrix,
    rotateY,
    scalem,
  } from "$lib/MV";
  import WebGl from "$lib/WebGL.svelte";
  import { createLoadObserver } from "$lib/Helpers";

  let ready = false;
  const onload = createLoadObserver(() => {
    ready = true;
    console.log("loaded!!!");
  });

  // controls
  let userIncr = 0.1;
  let userXPos = 0;
  let userXDir = 0;
  let userZPos = 2;
  let userZDir = -1;
  let userYPos = 0.5;
  let userYDir = 0;
  let userAngle = 270;
  let borders = [-5, 5];
  let oob = false;
  let down = false;
  let up = false;
  let rotate = 0;
  let forward = false;
  let backward = false;
  let left = false;
  let right = false;
  let lookup = false;
  let lookdown = false;

  const keyup = (e: KeyboardEvent) => {
    console.log(e.key);

    if (e.key === "Shift") down = false;
    if (e.key === " ") up = false;
    if (e.key.toLowerCase() === "w") forward = false;
    if (e.key.toLowerCase() === "s") backward = false;
    if (e.key.toLowerCase() === "a") left = false;
    if (e.key.toLowerCase() === "d") right = false;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") rotate = 0;
    if (e.key === "ArrowDown") lookdown = false;
    if (e.key === "ArrowUp") lookup = false;
  };

  const keydown = (e: KeyboardEvent) => {
    let [xNew, zNew] = [0, 0];
    if (e.key === "w") forward = true;
    else if (e.key === "s") backward = true;
    else if (e.key === "a") left = true;
    else if (e.key === "d") right = true;
    else if (e.key === " ") up = true;
    else if (e.key === "Shift") down = true;
    else if (e.key === "ArrowDown") lookdown = true;
    else if (e.key === "ArrowUp") lookup = true;
    else if (e.key === "ArrowLeft") rotate = -2;
    else if (e.key === "ArrowRight") rotate = 2;
  };

  const move = () => {
    let [x, y, z] = [0, 0, 0];
    if (down) y -= 0.1;
    if (up) y += 0.1;
    if (rotate !== 0) {
      userAngle += rotate;
      userAngle %= 360.0;
      userXDir = Math.cos(radians(userAngle));
      userZDir = Math.sin(radians(userAngle));
    }
    if (lookup) userYDir += 0.01;
    if (lookdown) userYDir -= 0.01;
    if (forward) {
      z += userIncr * userZDir;
      x += userIncr * userXDir;
    }
    if (backward) {
      z -= userIncr * userZDir;
      x -= userIncr * userXDir;
    }
    if (left) {
      z -= userIncr * userXDir;
      x += userIncr * userZDir;
    }
    if (right) {
      z += userIncr * userXDir;
      x -= userIncr * userZDir;
    }

    let colliding = false;
    wall_map.forEach((m) => {
      colliding = colliding || collisionCheck({ x, y, z }, m[0], m[1]);
    });
    if (oob || !colliding) {
      userZPos += z;
      userXPos += x;
      userYPos += y;
    }
  };

  const wall_map = [
    [
      { x: -5.25, y: 0, z: -5 },
      { x: -4.75, y: 2, z: 5 },
    ],
    [
      { x: 4.75, y: 0, z: -5 },
      { x: 5.25, y: 2, z: 5 },
    ],
    [
      { x: -5, y: 0, z: 4.75 },
      { x: 5, y: 2, z: 5.25 },
    ],
    [
      { x: -5, y: 0, z: -5.25 },
      { x: -1, y: 2, z: -4.75 },
    ],
    [
      { x: 1, y: 0, z: -5.25 },
      { x: 5, y: 2, z: -4.75 },
    ],
    [
      { x: -5, y: -0.25, z: -5 },
      { x: 5, y: 0.25, z: 5 },
    ],
    [
      { x: -5, y: 1.75, z: -5 },
      { x: 5, y: 2.25, z: 5 },
    ],
  ];

  interface POS {
    x: number;
    y: number;
    z: number;
  }

  const collisionCheck = (u: POS, c1: POS, c2: POS) => {
    const [nextX, nextY, nextZ] = [
      userXPos + u.x,
      userYPos + u.y,
      userZPos + u.z,
    ];

    if (
      nextX > c1.x &&
      nextY > c1.y &&
      nextZ > c1.z &&
      nextX < c2.x &&
      nextY < c2.y &&
      nextZ < c2.z
    )
      return true;
    return false;
  };

  const vs = `
    attribute  vec4 vPosition;
    attribute  vec2 vTexCoord;

    //varying vec4 fColor;
    varying vec2 fTexCoord;

    uniform mat4 projection;
    uniform mat4 modelview;

    void main() {
      fTexCoord = vTexCoord;
      gl_Position = projection * modelview * vPosition;
    } `;

  const fs = `
  precision mediump float;

  //varying vec4 fColor;
  varying vec2 fTexCoord;

  uniform sampler2D texture;

  void main() {
    // gl_FragColor = fColor * texture2D( texture, fTexCoord );
    gl_FragColor = texture2D( texture, fTexCoord );
  }`;

  // globals
  const numVertices = 6;
  let vBuffer: WebGLBuffer | null = null;
  let vPosition: number | null = null;
  let tBuffer: WebGLBuffer | null = null;
  let vTexCoord: number | null = null;
  let wall_texture: WebGLTexture | null = null;
  let wallImage: HTMLImageElement | null = null;
  let floor_texture: WebGLTexture | null = null;
  let floorImage: HTMLImageElement | null = null;
  let ceil_texture: WebGLTexture | null = null;
  let ceilImage: HTMLImageElement | null = null;
  let proLoc: WebGLUniformLocation | null = null;
  let mvLoc: WebGLUniformLocation | null = null;

  const vertices = [
    // Z-negative wall
    vec4(-1, 0.0, 0, 1.0),
    vec4(1.0, 0.0, 0, 1.0),
    vec4(1.0, 1.0, 0, 1.0),
    vec4(1.0, 1.0, 0, 1.0),
    vec4(-1, 1.0, 0, 1.0),
    vec4(-1, 0.0, 0, 1.0),
    // Hnútar gólfsins
    vec4(borders[0], 0.0, borders[1], 1.0),
    vec4(borders[1], 0.0, borders[1], 1.0),
    vec4(borders[1], 0.0, borders[0], 1.0),
    vec4(borders[1], 0.0, borders[0], 1.0),
    vec4(borders[0], 0.0, borders[0], 1.0),
    vec4(borders[0], 0.0, borders[1], 1.0),
  ];

  // Mynsturhnit fyrir vegg
  const texCoords = [
    // Z-negative wall
    vec2(0.0, 0.0),
    vec2(3.0, 0.0),
    vec2(3.0, 1.0),
    vec2(3.0, 1.0),
    vec2(0.0, 1.0),
    vec2(0.0, 0.0),
    // Mynsturhnit fyrir gólf
    vec2(0.0, 0.0),
    vec2(10.0, 0.0),
    vec2(10.0, 10.0),
    vec2(10.0, 10.0),
    vec2(0.0, 10.0),
    vec2(0.0, 0.0),
  ];

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    if (!prog) {
      console.error("Program object is null");
      return;
    }

    if (!floorImage || !ceilImage || !wallImage) {
      console.error("Wall image texture is null");
      return;
    }

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    vTexCoord = gl.getAttribLocation(prog, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    wall_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, wall_texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    /* prettier-ignore */
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,wallImage);
    gl.generateMipmap(gl.TEXTURE_2D);
    /* prettier-ignore */
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);

    floor_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, floor_texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    /* prettier-ignore */
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,floorImage);
    /* prettier-ignore */
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);

    ceil_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ceil_texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    /* prettier-ignore */
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ceilImage);
    /* prettier-ignore */
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);

    proLoc = gl.getUniformLocation(prog, "projection");
    mvLoc = gl.getUniformLocation(prog, "modelview");

    var proj = perspective(50.0, 1.0, 0.2, 100.0);
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
  };

  const translations = [
    vec3(0.0, 0.0, 5.0),
    vec3(5.0, 0.0, 0.0),
    vec3(-5.0, 0.0, 0.0),
  ];
  const rotations = [0, 90, 90];

  const render = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    move();

    // staðsetja áhorfanda og meðhöndla músarhreyfingu
    let mv = lookAt(
      vec3(userXPos, userYPos, userZPos),
      vec3(userXPos + userXDir, userYPos + userYDir, userZPos + userZDir),
      vec3(0.0, 1.0, 0.0)
    );

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    // Teikna vegg með mynstri
    gl.bindTexture(gl.TEXTURE_2D, wall_texture);
    for (let i = 0; i < 4; ++i) {
      let temp_mv = mult(mv, translate(translations[i])) as matrix;
      temp_mv = mult(temp_mv, rotateY(rotations[i])) as matrix;
      temp_mv = mult(temp_mv, scalem(vec3(5, 2, 0))) as matrix;
      gl.uniformMatrix4fv(mvLoc, false, flatten(temp_mv));
      gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    let temp_mv_l = mult(mv, translate(vec3(-3.0, 0.0, -5.0))) as matrix;
    temp_mv_l = mult(temp_mv_l, scalem(vec3(2.0, 2, 0))) as matrix;
    gl.uniformMatrix4fv(mvLoc, false, flatten(temp_mv_l));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    let temp_mv_r = mult(mv, translate(vec3(3, 0.0, -5.0))) as matrix;
    temp_mv_r = mult(temp_mv_r, scalem(vec3(2, 2, 0))) as matrix;
    gl.uniformMatrix4fv(mvLoc, false, flatten(temp_mv_r));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    // floor
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.bindTexture(gl.TEXTURE_2D, floor_texture);
    gl.drawArrays(gl.TRIANGLES, numVertices, numVertices);

    // ceiling
    mv = mult(mv, translate(vec3(0.0, 2.0, 0.0))) as matrix;
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
    gl.bindTexture(gl.TEXTURE_2D, ceil_texture);
    gl.drawArrays(gl.TRIANGLES, numVertices, numVertices);

    window.requestAnimationFrame(() => render(gl));
  };
</script>

<h1>Ótrúlegi tumakassinn</h1>

{#if !ready}
  <p>Sæki myndir...</p>
{:else}
  <WebGl {vs} {fs} {buffer} {render} />
{/if}

<input type="checkbox" id="oob" bind:checked={oob} />
<label for="oob">Slökkva á collision: {oob ? "já" : "nei"}</label>

<img
  bind:this={wallImage}
  use:onload
  src="/brick29.jpg"
  alt="Brick wall texture, hidden from the dom"
  hidden
/>
<img
  bind:this={floorImage}
  use:onload
  src="/WoodPlanks.jpg"
  alt="Floor texture, hidden from the dom"
  hidden
/>
<img
  bind:this={ceilImage}
  use:onload
  src="/tumi.jpg"
  alt="Floor texture, hidden from the dom"
  hidden
/>

<p>wasd til að hreyfa myndavélina</p>
<p>örvatakkar til að snúa myndavélinni</p>
<p>
  bil til að fljúga upp og shift til að fjlúga niður (bara hægt out of bounds)
</p>

<svelte:window on:keydown|preventDefault={keydown} on:keyup={keyup} />
