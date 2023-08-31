//////////////////////////////////////////////////////////////////////////////
//
//  Angel.js - modified by Þorvaldur Tumi Baldursson
//
//////////////////////////////////////////////////////////////////////////////

export type matrix = number[][];
export type vector = number[];

/**
 * Degrees to radians
 * @param degrees number of degrees
 * @returns `number` that is the radians
 *
 */
const radians = (degs: number) => {
  return (degs * Math.PI) / 180.0;
};

/**
 * Radians to degrees
 * @param radians number of radians
 * @returns `number` that is the degrees
 */
const degrees = (rads: number) => {
  return (rads * 180.0) / Math.PI;
};

//  Vector Constructors

/**
 * Vector of length 2
 * @param args numbers to be put into the vector, parametrs `n > 2` are ignored
 * @returns `number[]`
 */
function vec2(...args: number[]): vector {
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
const vec3 = (...args: number[]): vector => {
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
const vec4 = (...args: number[]): vector => {
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
const mat2 = (...args: number[]): matrix => {
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
const mat3 = (...args: number[]): matrix => {
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
const mat4 = (...args: number[]): matrix => {
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

const isMatrix = (m: matrix | vector): m is matrix => {
  return (m as matrix)[0].length !== undefined;
};

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

const equal = (u: vector | matrix, v: vector | matrix): boolean => {
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

//----------------------------------------------------------------------------

function add(u: vector, v: vector) {
  let result = [];
    if (u.length != v.length) {
      throw "add(): vectors are not the same dimension";
    }

    for (let i = 0; i < u.length; ++i) {
      result.push(u[i] + v[i]);
    }

    return result;
}

//----------------------------------------------------------------------------

function subtract(u, v) {
  var result = [];

  if (u.matrix && v.matrix) {
    if (u.length != v.length) {
      throw (
        "subtract(): trying to subtract matrices" + " of different dimensions"
      );
    }

    for (var i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        throw (
          "subtract(): trying to subtact matrices" + " of different dimensions"
        );
      }
      result.push([]);
      for (var j = 0; j < u[i].length; ++j) {
        result[i].push(u[i][j] - v[i][j]);
      }
    }

    result.matrix = true;

    return result;
  } else if ((u.matrix && !v.matrix) || (!u.matrix && v.matrix)) {
    throw "subtact(): trying to subtact  matrix and non-matrix variables";
  } else {
    if (u.length != v.length) {
      throw "subtract(): vectors are not the same length";
    }

    for (var i = 0; i < u.length; ++i) {
      result.push(u[i] - v[i]);
    }

    return result;
  }
}

//----------------------------------------------------------------------------

function mult(u, v) {
  var result = [];

  if (u.matrix && v.matrix) {
    if (u.length != v.length) {
      throw "mult(): trying to add matrices of different dimensions";
    }

    for (var i = 0; i < u.length; ++i) {
      if (u[i].length != v[i].length) {
        throw "mult(): trying to add matrices of different dimensions";
      }
    }

    for (var i = 0; i < u.length; ++i) {
      result.push([]);

      for (var j = 0; j < v.length; ++j) {
        var sum = 0.0;
        for (var k = 0; k < u.length; ++k) {
          sum += u[i][k] * v[k][j];
        }
        result[i].push(sum);
      }
    }

    result.matrix = true;

    return result;
  }

  if (u.matrix && u.length == v.length) {
    for (var i = 0; i < v.length; i++) {
      var sum = 0.0;
      for (var j = 0; j < v.length; j++) {
        sum += u[i][j] * v[j];
      }
      result.push(sum);
    }
    return result;
  } else {
    if (u.length != v.length) {
      throw "mult(): vectors are not the same dimension";
    }

    for (var i = 0; i < u.length; ++i) {
      result.push(u[i] * v[i]);
    }

    return result;
  }
}

function scale( s:number, u:vector )
{
    if ( !Array.isArray(u) ) {
        throw "scale: second parameter " + u + " is not a vector";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

function translate(x, y, z) {
  if (Array.isArray(x) && x.length == 3) {
    z = x[2];
    y = x[1];
    x = x[0];
  }

  var result = mat4();
  result[0][3] = x;
  result[1][3] = y;
  result[2][3] = z;

  return result;
}

function flatten(v: vector[] | vector) {
  // TODO: add matrix support
  let floats = new Float32Array(v.flat())
  return floats;
}

//----------------------------------------------------------------------------

const sizeof = {
  vec2: new Float32Array(flatten(vec2())).byteLength,
  vec3: new Float32Array(flatten(vec3())).byteLength,
  vec4: new Float32Array(flatten(vec4())).byteLength,
  mat2: new Float32Array(flatten(mat2())).byteLength,
  mat3: new Float32Array(flatten(mat3())).byteLength,
  mat4: new Float32Array(flatten(mat4())).byteLength,
};

export { vec2, vec3, vec4, mat2, mat3, mat4, isMatrix, equal, flatten, add, scale, sizeof };
