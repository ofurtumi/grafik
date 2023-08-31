//////////////////////////////////////////////////////////////////////
//    Sýnidæmi fyrir heimadæmi 1 í Tölvugrafík
//     Rétthyrningur teiknaður með tveimur sjálfstæðum þríhyrningum
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
//////////////////////////////////////////////////////////////////////
let gl;
let points;
let strip = window.location.search;
console.log(strip);

window.onload = function init() {
  let canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  points = [
    vec2(-0.5, 0.25),
    vec2(-0.5, -0.25),
    vec2(0.5, 0.25),
    vec2(0.5, -0.25),
  ];

  //  Configure WebGL

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //  Load shaders and initialize attribute buffers

  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Load the data into the GPU

  let bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Associate out shader letiables with our data buffer

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  render();
};

function render() {
  console.log(points);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, points.length);
}
