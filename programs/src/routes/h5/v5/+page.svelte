<script lang="ts">
  import {
    flatten,
    lookAt,
    mult,
    perspective,
    rotateX,
    rotateY,
    vec3,
    vec4,
    type matrix,
  } from "$lib/MV";
  import { teapot } from "./teapotData";
  import WebGl from "$lib/WebGL.svelte";

  // globals
  let at = vec3(0.0, 0.0, 0.0);
  let up = vec3(0.0, 1.0, 0.0);

  let fovy = 50.0;
  let near = 0.2;
  let far = 100.0;

  let va = vec4(0.0, 0.0, -1.0, 1);
  let vb = vec4(0.0, 0.942809, 0.333333, 1);
  let vc = vec4(-0.816497, -0.471405, 0.333333, 1);
  let vd = vec4(0.816497, -0.471405, 0.333333, 1);

  let lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
  let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
  let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
  let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

  let materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
  let materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
  let materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
  let materialShininess = 150.0;

  let points = [];
  let normals = [];

  // vertex shader
  const vs = `
  attribute vec4 vPosition;
  attribute vec4 vNormal;
  varying vec3 N, L, E;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform vec4 lightPosition;
  uniform mat3 normalMatrix;

  void main() {
    vec3 pos = (modelViewMatrix * vPosition).xyz;

    // check for directional light
    if(lightPosition.w == 0.0) L = normalize(lightPosition.xyz);
    else L = normalize( lightPosition.xyz - pos );

    E =  -normalize(pos);
    N = normalize( normalMatrix*vNormal.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
  }`;

  // fragment shader
  const fs = `
  precision mediump float;

  uniform vec4 ambientProduct;
  uniform vec4 diffuseProduct;
  uniform vec4 specularProduct;
  uniform float shininess;
  varying vec3 N, L, E;

  void main() {
    vec4 fColor;

    vec3 H = normalize( normalize(L) + normalize(E) );
    vec4 ambient = ambientProduct;

    float Kd = max( dot(normalize(L), normalize(N)), 0.0 );
    vec4  diffuse = Kd*diffuseProduct;

    float Ks = pow( max(dot(normalize(N), H), 0.0), shininess );
    vec4  specular = Ks * specularProduct;

    if( dot(normalize(L), normalize(N)) < 0.0 ) specular = vec4(0.0, 0.0, 0.0, 1.0);

    fColor = ambient + diffuse +specular;
    fColor.a = 1.0;

    gl_FragColor = fColor;
  }`;

  // shader globals
  let vBuffer: WebGLBuffer | null = null;
  let vPosition: number | null = null;
  let nBuffer: WebGLBuffer | null = null;
  let vNormal: number | null = null;

  let normalMatrix: matrix;
  let normalMatrixLoc: WebGLUniformLocation | null = null;
  let modelViewMatrixLoc: WebGLUniformLocation | null = null;
  let lightPositionLoc: WebGLUniformLocation | null = null;

  let desired_quality = 9;
  let current_quality = 9;
  let myTeapot = teapot(current_quality);
  let num_points = myTeapot.TriangleVertices.length;

  const redo_tepot = (quality: number, gl: WebGLRenderingContext) => {
    myTeapot = teapot(quality);
    myTeapot.scale(0.5, 0.5, 0.5);
    num_points = myTeapot.TriangleVertices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      flatten(myTeapot.TriangleVertices),
      gl.STATIC_DRAW
    );
    if (!vPosition && vPosition !== 0) {
      console.error("No position");
      return;
    }
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(myTeapot.Normals), gl.STATIC_DRAW);

    if (!vNormal && vNormal !== 0) {
      console.error("No position");
      return;
    }
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
  };

  const buffer = (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    myTeapot.scale(0.5, 0.5, 0.5);
    points = myTeapot.TriangleVertices;
    normals = myTeapot.Normals;
    num_points = points.length;

    if (!prog) {
      console.error("No program");
      return;
    }

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(prog, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation(prog, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    let projectionMatrix = perspective(fovy, 1.0, near, far);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(prog, "projectionMatrix"),
      false,
      flatten(projectionMatrix)
    );

    normalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");
    modelViewMatrixLoc = gl.getUniformLocation(prog, "modelViewMatrix");

    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(
      gl.getUniformLocation(prog, "ambientProduct"),
      flatten(ambientProduct)
    );
    gl.uniform4fv(
      gl.getUniformLocation(prog, "diffuseProduct"),
      flatten(diffuseProduct)
    );
    gl.uniform4fv(
      gl.getUniformLocation(prog, "specularProduct"),
      flatten(specularProduct)
    );
    lightPositionLoc = gl.getUniformLocation(prog, "lightPosition");
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(prog, "shininess"), materialShininess);
  };

  const render = (gl: WebGLRenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (desired_quality !== current_quality) {
      current_quality = desired_quality;
      redo_tepot(current_quality, gl);
    }

    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));

    let mv = lookAt(vec3(0.0, 0.0, z_view), at, up);
    mv = mult(mv, rotateX(rot_x)) as matrix;
    mv = mult(mv, rotateY(rot_y)) as matrix;

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv));
    normalMatrix = [
      vec3(mv[0][0], mv[0][1], mv[0][2]),
      vec3(mv[1][0], mv[1][1], mv[1][2]),
      vec3(mv[2][0], mv[2][1], mv[2][2]),
    ];

    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, num_points);
    window.requestAnimationFrame(() => render(gl));
  };

  // movement controls
  let movement = false; // Do we rotate?
  let rot_x = 0;
  let rot_y = 0;
  let origin_x: number;
  let origin_y: number;
  let z_view = -5;

  // controls
  const mousedown = (e: MouseEvent) => {
    movement = true;
    origin_x = e.clientX;
    origin_y = e.clientY;
  };

  const mouseup = () => {
    movement = false;
  };

  const mousemove = (e: MouseEvent) => {
    if (movement) {
      rot_y = (rot_y + (e.clientX - origin_x)) % 360;
      rot_x = (rot_x + (origin_y - e.clientY)) % 360;
      origin_x = e.clientX;
      origin_y = e.clientY;
    }
  };

  const mousescroll = (e: WheelEvent) => {
    z_view += e.deltaY * 0.01;
  };

  const keydown = (e: KeyboardEvent) => {
    if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
      desired_quality = parseInt(e.key);
    }

    switch (e.key) {
      case "ArrowLeft":
        lightPosition[0] -= 0.1;
        break;
      case "ArrowRight":
        lightPosition[0] += 0.1;
        break;
      case "ArrowDown":
        lightPosition[1] -= 0.1;
        break;
      case "ArrowUp":
        lightPosition[1] += 0.1;
        break;
    }
  };
</script>

<div
  on:mousedown|preventDefault={mousedown}
  on:mouseup|preventDefault={mouseup}
  on:mousemove|preventDefault={mousemove}
  on:wheel={mousescroll}
>
  <WebGl {fs} {vs} {buffer} {render} num={undefined} />
</div>

<svelte:window on:keydown={keydown} />
