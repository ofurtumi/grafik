type shader_types =
  | WebGLRenderingContext["VERTEX_SHADER"]
  | WebGLRenderingContext["FRAGMENT_SHADER"];

// Initialize a shader program, so WebGL knows how to draw our data
const initShaderProgram = (
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string
) => {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  if (!shaderProgram || !vertexShader || !fragmentShader) {
    alert("Vantar shader");
    return;
  }
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram
      )}`
    );
    return null;
  }

  return shaderProgram;
};

// creates a shader of the given type, uploads the source and compiles it.
const loadShader = (
  gl: WebGLRenderingContext,
  type: shader_types,
  source: string
) => {
  const shader = gl.createShader(type);
  if (!shader) return null;

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

export default initShaderProgram;
