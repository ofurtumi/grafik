//////////////////////////////////////////////////////////////////////////////
//
//  Angel.js - modified by Þorvaldur Tumi Baldursson
//
//////////////////////////////////////////////////////////////////////////////

/**
 * simple 2d array type
 */
export type matrix = number[][];

/**
 * simple 1d array type
 */
export type vector = number[];

/**
 * Degrees to radians
 * @param degrees number of degrees
 * @returns `number` that is the radians
 *
 */
export const radians = (degs: number) => {
  return (degs * Math.PI) / 180.0;
};

/**
 * Radians to degrees
 * @param radians number of radians
 * @returns `number` that is the degrees
 */
export const degrees = (rads: number) => {
  return (rads * 180.0) / Math.PI;
};

/**
 * Calculates the distance between two vectors
 * @param u vector
 * @param v vector
 * @returns `number` that is the distance between `u` and `v`
 */
export const distance = (u: vector, v: vector) => {
  if (u.length != v.length) {
    throw "distance(): vectors are not the same dimension";
  }

  let sum = 0.0;

  for (let i = 0; i < u.length; ++i) {
    sum += Math.pow(u[i] - v[i], 2);
  }
  return Math.sqrt(sum);
};

//  Vector Constructors
/**
 * Vector of length 2
 * @param args numbers to be put into the vector, parametrs `n > 2` are ignored
 * @returns `number[]`
 */
export function vec2(...args: number[]): vector {
  const result: number[] = args.map((x) => (x === undefined ? 0.0 : x));

  switch (result.length) {
    case 0:
      result.push(0.0);
    case 1:
      result.push(0.0);
  }

  return result.splice(0, 2);
}

/**
 * Vector of length 3
 * @param args numbers to be put into the vector, parametrs `n > 3` are ignored
 * @returns `number[]`
 */
export const vec3 = (...args: number[]): vector => {
  const result: number[] = args.map((x) => (x === undefined ? 0.0 : x));

  switch (result.length) {
    case 0:
      result.push(0.0);
    case 1:
      result.push(0.0);
    case 2:
      result.push(0.0);
  }

  return result.splice(0, 3);
};

/**
 * Vector of length 4
 * @param args numbers to be put into the vector, parametrs `n > 4` are ignored
 * @returns `number[]`
 */
export const vec4 = (...args: number[]): vector => {
  const result: number[] = args.map((x) => (x === undefined ? 0.0 : x));

  switch (result.length) {
    case 0:
      result.push(0.0);
    case 1:
      result.push(0.0);
    case 2:
      result.push(0.0);
    case 3:
      result.push(1.0);
  }

  return result.splice(0, 4);
};

//  Matrix Constructors

/**
 * Two dimensional matrix
 * n == 0 => the identity matrix aka, `[[1,0],[0,1]]`
 * n == 1 => diagonal matrix with that argument on the diagonal
 * n >= 2 => the matrix with those arguments as values in order
 * @param args numbers to be put into the matrix, parametrs `n > 4` are ignored
 * @returns `number[][]`
 */
export const mat2 = (...args: number[]): matrix => {
  let [a1 = 1, a2, b1, b2] = args;
  if (a2 === undefined) {
    [(a2 = 0), (b1 = a2), (b2 = a1)];
  }

  // prettier-ignore
  let data = [
    vec2(a1, a2), 
    vec2(b1, b2)
  ];

  return data;
};

/**
 * # Three dimensional matrix
 * n == 0 => the identity matrix aka `[[1,0,0],[0,1,0],[0,0,1]]`
 * n == 1 => a diagonal matrix with that argument on the diagonal
 * n >= 2 => a 3x3 matrix where the first three arguments are the first row, etc.
 * @param args numbers to be put into the matrix, parametrs `n > 9` are ignored
 * @returns `number[][]`
 */
export const mat3 = (...args: number[]): matrix => {
  // prettier-ignore
  let [
    a1 = 1, a2, a3, 
    b1,     b2, b3, 
    c1,     c2, c3
  ] = args;

  if (args[1] === undefined) {
    [(b2 = a1), (c3 = a1)];
  }

  // prettier-ignore
  let data = [
    vec3(a1, a2, a3), 
    vec3(b1, b2, b3), 
    vec3(c1, c2, c3)
  ];

  return data;
};

/**
 * # Four dimensional matrix
 * n == 0 => the identity matrix aka `[[1,0,0,0],[0,1,0,0],[0,0,1,0], [0,0,0,1]]`
 * n == 1 => a diagonal matrix with that argument on the diagonal
 * n >= 2 => a 4*4 matrix where the first three arguments are the first row, etc.
 * @param args numbers to be put into the matrix, parametrs `n > 16` are ignored
 * @returns `number[][]`
 */
export const mat4 = (...args: number[]): matrix => {
  // prettier-ignore
  let [
    a1 = 1, a2, a3, a4, 
    b1,     b2, b3, b4, 
    c1,     c2, c3, c4, 
    d1,     d2, d3, d4
  ] = args;

  if (args[1] === undefined) {
    [(b2 = a1), (c3 = a1), (d4 = a1)];
  }

  // prettier-ignore
  let data = [
    vec4(a1, a2, a3, a4),
    vec4(b1, b2, b3, b4),
    vec4(c1, c2, c3, c4),
    vec4(d1, d2, d3, d4),
  ];

  return data;
};

/**
 * # Typechekcing for matrix
 * @param `m` a matrix or vector
 * @returns `boolean` true if `m` is a matrix
 */
export const isMatrix = (m: matrix | vector): m is matrix => {
  if (Array.isArray((m as matrix)[0])) {
    return m.length === (m[0] as vector).length;
  }
  return false;
};

/**
 * # Equality check for matrix and vectors
 * @param `u` a matrix or vector
 * @param `v` a matrix or vector
 * @returns `boolean` true if `u` and `v` are equal
 */
export const equal = (u: vector | matrix, v: vector | matrix): boolean => {
  if (u.length !== v.length) {
    return false;
  }

  if (isMatrix(u) && isMatrix(v)) {
    for (let i = 0; i < u.length; i++) {
      if (u[i].length !== v[i].length) {
        return false;
      }
      for (var j = 0; j < u[i].length; ++j) {
        if (u[i][j] !== v[i][j]) {
          return false;
        }
      }
    }
  }

  for (var i = 0; i < u.length; ++i) {
    if (u[i] !== v[i]) {
      return false;
    }
  }

  return true;
};

/**
 * # Vector and matrix addition
 * Adds two vectors or matrices together
 * Vector example: [1,2] + [3,4] = [4,6]
 * Matrix example: [[1,2],[3,4]] + [[5,6],[7,8]] = [[6,8],[10,12]]
 * should work for any length of vector
 * @param `u` a vector or matrix
 * @param `v` a vector or matrix
 * @returns `vector` or `matrix` that is the sum of `u` and `v`
 */
export const add = (u: vector | matrix, v: vector | matrix) => {
  if (u.length != v.length) {
    throw "add(): objects are not the same dimension";
  }

  if (isMatrix(u) && isMatrix(v)) {
    if (u.length !== v.length) {
      throw "add(): trying to add matrices of different dimensions";
    }

    let result: number[][] = [];

    for (let i = 0; i < u.length; ++i) {
      if (u[i].length !== v[i].length) {
        throw "add(): trying to add matrices of different dimensions";
      }

      result.push([]);
      for (let j = 0; j < u[i].length; ++j) {
        result[i].push(Number(u[i][j]) + Number(v[i][j]));
      }
    }
    return result as matrix;
  }

  let result: vector = [];
  for (let i = 0; i < u.length; ++i) {
    result.push((u[i] as number) + (v[i] as number));
  }

  return result as vector;
};

/**
 * # Vector and matrix subtraction
 * Subtracts two vectors or matrices
 * Vecotr example: [1,2] - [3,4] = [-2,-2]
 * Matrix example: [[1,2],[3,4]] - [[5,6],[7,8]] = [[-4,-4],[-4,-4]]
 * should work for any length of vector
 * @param `u` a vector or matrix
 * @param `v` a vector or matrix
 * @returns `vector` or `matrix` that is the difference of `u` and `v`
 * @throws `string` if `u` and `v` are not the same dimension
 * @throws `string` if `u` and `v` are matrices and not the same dimension
 */
export const subtract = (u: vector | matrix, v: vector | matrix) => {
  if (u.length != v.length) {
    throw "add(): objects are not the same dimension";
  }

  if (isMatrix(u) && isMatrix(v)) {
    if (u.length !== v.length) {
      throw "add(): trying to add matrices of different dimensions";
    }

    let result: number[][] = [];

    for (let i = 0; i < u.length; ++i) {
      if (u[i].length !== v[i].length) {
        throw "add(): trying to add matrices of different dimensions";
      }

      result.push([]);
      for (let j = 0; j < u[i].length; ++j) {
        result[i].push(Number(u[i][j]) - Number(v[i][j]));
      }
    }
    return result as matrix;
  }

  let result: vector = [];
  for (let i = 0; i < u.length; ++i) {
    result.push((u[i] as number) - (v[i] as number));
  }

  return result as vector;
};

/**
 * # Vector and matrix multiplication
 * Multiplies two vectors, two matrices or a vector and a matrix
 * Vector example: [1,2] * [3,4] = [3, 8]
 * Matrix example: [[1,2],[3,4]] * [[5,4],[3,2]] = [[5,8],[9,8]]
 * If M*V, matrix needs to be first parameter
 * @param `u` a vector or matrix
 * @param `v` a vector or matrix
 * @returns `vector` or `matrix` that is the multiplication of `u` and `v`
 * @throws `string` if `u` and `v` are not the same dimension
 * @throws `string` if `u` and `v` are matrices and not the same dimension
 */
export const mult = (u: vector | matrix, v: vector | matrix) => {
  // matrix * matrix
  if (isMatrix(u) && isMatrix(v)) {
    if (u.length != v.length) {
      throw "mult(): trying to add matrices of different dimensions";
    }

    let result: matrix = [];

    for (let i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        throw "mult(): trying to add matrices of different dimensions";
      }

      result.push([]);
      for (let j = 0; j < v.length; ++j) {
        let sum = 0.0;
        for (var k = 0; k < u.length; ++k) {
          sum += u[i][k] * v[k][j];
        }
        result[i].push(sum);
      }
    }

    return result;
  }

  // matrix * vector
  if (isMatrix(u) && u.length == v.length) {
    let result: vector = [];

    for (let i = 0; i < v.length; i++) {
      let sum = 0.0;
      for (let j = 0; j < v.length; j++) {
        sum += u[i][j] * (v as vector)[j];
      }
      result.push(sum);
    }
    return result;
  } else {
    if (u.length != v.length && !isMatrix(u) && !isMatrix(v)) {
      throw "mult(): vectors are not the same dimension";
    }

    let result: vector = [];

    for (var i = 0; i < u.length; ++i) {
      result.push((u as vector)[i] * (v as vector)[i]);
    }

    return result;
  }
};

/**
 * # Vector scaling
 * @param s number to scale by
 * @param u vector
 * @returns `vector` that is the scaled vector
 * @throws `string` if `u` is not a vector
 */
export const scale = (s: number, u: vector) => {
  if (!Array.isArray(u)) {
    throw "scale: second parameter " + u + " is not a vector";
  }

  let result: vector = [];
  for (var i = 0; i < u.length; ++i) {
    result.push(s * u[i]);
  }

  return result;
};

/**
 * # Matrix scaling
 * @param v vector of length 3
 * @returns `matrix` that is the scaling matrix
 * @throws `string` if `v` is not a vector of length 3
 */
export const scalem = (v: vector) => {
  const [x, y, z] = v;

  let result: matrix = mat4();
  result[0][0] = x;
  result[1][1] = y;
  result[2][2] = z;

  return result;
};

export const translate = (
  v: vector | number,
  y_: number | null = null,
  z_: number | null = null
) => {
  const [x, y, z] = (v as vector) ?? [v as number, y_ ?? 0, z_ ?? 0];

  let result = mat4();
  result[0][3] = x;
  result[1][3] = y;
  result[2][3] = z;

  return result;
};

const transpose = (m: matrix) => {
  if (!isMatrix(m)) {
    throw "transpose(): trying to transpose a non-matrix";
  }

  let result: matrix = [];
  for (let i = 0; i < m.length; ++i) {
    result.push([]);
    for (let j = 0; j < m[0].length; ++j) {
      result[i].push(m[j][i]);
    }
  }

  return result;
};

export const flatten = (v: matrix | vector) => {
  if (isMatrix(v)) {
    v = transpose(v);
  }

  let n = v.length;
  let EAA = false;

  if (Array.isArray(v[0])) {
    EAA = true;
    n *= v[0].length;
  }

  let floats = new Float32Array(n);
  if (EAA) {
    let idx = 0;
    for (let i = 0; i < v.length; ++i) {
      for (let j = 0; j < (v[i] as number[]).length; ++j) {
        floats[idx++] = (v[i] as number[])[j];
      }
    }
  } else {
    for (let i = 0; i < v.length; ++i) {
      floats[i] = Number(v[i]);
    }
  }

  return floats;
};

/**
 * Part of a function group that returna a rotation matrix
 *
 * @param theta number of degrees to rotate by
 * @returns `matrix` that is the rotation matrix
 */
export const rotateX = (theta: number) => {
  const c = Math.cos(radians(theta));
  const s = Math.sin(radians(theta));
  const rx = mat4(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    c,
    -s,
    0.0,
    0.0,
    s,
    c,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );
  return rx;
};

/**
 * Part of a function group that returna a rotation matrix
 *
 * @param theta number of degrees to rotate by
 * @returns `matrix` that is the rotation matrix
 */
export const rotateY = (theta: number) => {
  const c = Math.cos(radians(theta));
  const s = Math.sin(radians(theta));
  const ry = mat4(
    c,
    0.0,
    s,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    -s,
    0.0,
    c,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );
  return ry;
};

/**
 * Part of a function group that returna a rotation matrix
 *
 * @param theta number of degrees to rotate by
 * @returns `matrix` that is the rotation matrix
 */
export const rotateZ = (theta: number) => {
  const c = Math.cos(radians(theta));
  const s = Math.sin(radians(theta));
  const rz = mat4(
    c,
    -s,
    0.0,
    0.0,
    s,
    c,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );
  return rz;
};

export const rotateAll = (thetas: vector) => {
  let mat = mat4();
  mat = mult(rotateX(thetas[0]), mat) as matrix;
  mat = mult(rotateY(thetas[1]), mat) as matrix;
  mat = mult(rotateZ(thetas[2]), mat) as matrix;
  return mat;
};

export const perspective = (
  fovy: number,
  aspect: number,
  near: number,
  far: number
) => {
  let f = 1.0 / Math.tan(radians(fovy) / 2);
  let d = far - near;

  const result = mat4();
  result[0][0] = f / aspect;
  result[1][1] = f;
  result[2][2] = -(near + far) / d;
  result[2][3] = (-2 * near * far) / d;
  result[3][2] = -1;
  result[3][3] = 0.0;

  return result;
};

export const lookAt = (eye: vector, at: vector, up: vector) => {
  if (!Array.isArray(eye) || eye.length != 3) {
    throw "lookAt(): first parameter [eye] must be an a vec3";
  }

  if (!Array.isArray(at) || at.length != 3) {
    throw "lookAt(): first parameter [at] must be an a vec3";
  }

  if (!Array.isArray(up) || up.length != 3) {
    throw "lookAt(): first parameter [up] must be an a vec3";
  }

  if (equal(eye, at)) {
    return mat4();
  }

  let v = normalize(subtract(at, eye) as vector); // view direction vector
  let n = normalize(cross(v, up)); // perpendicular vector
  let u = normalize(cross(n, v)); // "new" up vector

  v = negate(v);

  let result = mat4(
    ...vec4(...n, -dot(n, eye)),
    ...vec4(...u, -dot(u, eye)),
    ...vec4(...v, -dot(v, eye)),
    ...vec4()
  );

  return result;
};

export const length = (u: vector) => {
  return Math.sqrt(dot(u, u));
};

export const normalize = (u: vector, excludeLastComponent: boolean = false) => {
  let result: vector = [];
  u.forEach((x) => result.push(x));

  let last = excludeLastComponent ? result.pop() : null;

  let len = length(result);

  if (!isFinite(len)) {
    throw "normalize: vector " + u + " has zero length";
  }
  for (let i = 0; i < result.length; ++i) {
    result[i] /= len;
  }
  if (excludeLastComponent && last && typeof last === "number") {
    result.push(last);
  }

  return result;
};

/**
 * Calculates the cross product of two vectors
 *
 * @param u vector of length at least 3
 * @param v vector of length at least 3
 * @returns a 3d vector that is the cross product of `u` and `v`
 */
export const cross = (u: vector, v: vector) => {
  if (!Array.isArray(u) || u.length < 3) {
    throw "cross(): first argument is not a vector of at least 3";
  }

  if (!Array.isArray(v) || v.length < 3) {
    throw "cross(): second argument is not a vector of at least 3";
  }

  const result = [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];

  return result;
};

/*
 * Negates a given vector
 * for example the vector [1,2,-1] would become [-1,-2,1]
 * @param u vector to be negated
 * @returns `vector` that is the negated vector
 */
export const negate = (u: vector) => {
  let result = [];
  for (let i = 0; i < u.length; ++i) {
    result.push(-u[i]);
  }

  return result;
};

/**
 * Calculates the dot product of two vectors
 * @param u vector
 * @param v vector
 * @returns `number` that is the dot product of `u` and `v`
 */
export const dot = (u: vector, v: vector) => {
  if (u.length != v.length) {
    throw "dot(): vectors are not the same ";
  }

  let sum = 0.0;
  for (let i = 0; i < u.length; ++i) {
    sum += u[i] * v[i];
  }

  return sum;
};
