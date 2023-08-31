// Þorvaldur Tumi Baldursson
// 27.08.2023
// Forrit sem teikna N marga þríhyrninga með slembi litum
// notast við nokkur hjálparföll skilgreind í ../lib/helpers.js

let gl;
let triangles = [];
let colorLoc;

let n_triangles = 100;

const init = () => {
  let canvas = document.querySelector("canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  for (let i = 0; i < n_triangles; i++) {
    triangles.push(vec2(0, 0.05), vec2(-0.05, -0.05), vec2(0.05, -0.05));
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 1.0, 1.0, 1.0);

  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  let bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");

  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Find the location of the variable fColor in the shader program
  colorLoc = gl.getUniformLocation(program, "fColor");
  offsetLoc = gl.getUniformLocation(program, "offset");

  render();
};

const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < triangles.length; i += 3) {
    gl.uniform4fv(colorLoc, random_rgb());
    gl.uniform2fv(
      offsetLoc,
      vec2(rand_between(-1.0, 1.0), rand_between(-1.0, 1.0))
    );
    gl.drawArrays(gl.TRIANGLE_FAN, i, 3);
  }
};

window.onload = init;
