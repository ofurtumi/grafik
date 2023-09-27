// Þorvaldur Tumi Baldursson
//
// Einföld en mjög gagnleg hjálparföll fyrir WebGL forritun
// ath. passa þegar þú breytir framtíðar Tumi, gæti brotið núverandi forrit

// Skilar tölu á bilinu [min, max)
import { vec2, vec3, vec4, type matrix, type vector } from "./MV";

const rand_between = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// einfalt sleep fall, notar promises, fengið héðan: https://stackoverflow.com/a/39914235
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Skilar hnitum fyrir þríhyrning með miðju í (x, y) og stærð size
const tri_from_coords = (x: number, y: number, size = 0.5, dir = 1) => {
  let points: vector[] = [];
  switch (dir) {
    case 0:
      points.push(vec2(x, y + size));
      points.push(vec2(x - size, y - size));
      points.push(vec2(x + size, y - size));
      break;
    case 1:
      points.push(vec2(x + size, y));
      points.push(vec2(x - size, y + size));
      points.push(vec2(x - size, y - size));
      break;
    case 2:
      points.push(vec2(x, y - size));
      points.push(vec2(x + size, y + size));
      points.push(vec2(x - size, y + size));
      break;
    case 3:
      points.push(vec2(x - size, y));
      points.push(vec2(x + size, y + size));
      points.push(vec2(x + size, y - size));
      break;
  }

  return points;
};

const rect_from_coords = (
  x: number,
  y: number,
  size_x = 0.5,
  size_y = size_x
) => {
  let points = [
    ...vec2(x - size_x, y + size_y),
    ...vec2(x - size_x, y - size_y),
    ...vec2(x + size_x, y - size_y),
    ...vec2(x + size_x, y + size_y),
  ];

  return points;
};

const rect = (top: vector, bot: vector) => {
  return [top, vec2(top[0], bot[1]), bot, vec2(bot[0], top[1])];
};

// skilar slembi RGBA vektor, skemmtileg staðreynd, hundurinn minn heitir Vektor
const random_rgba = () => {
  return vec4(Math.random(), Math.random(), Math.random(), 1.0);
};

const colorCube = (radius: number) => {
  let points: matrix = [];
  let colors: matrix = [];

  const indices = [
    [1, 0, 3, 2],
    [2, 3, 7, 6],
    [3, 0, 4, 7],
    [6, 5, 1, 2],
    [4, 5, 6, 7],
    [5, 4, 0, 1],
  ];

  indices.forEach(([a, b, c, d]) => {
    const [tp, tc] = quad(radius, a, b, c, d);
    points.push(...tp);
    colors.push(...tc);
  });

  return [points, colors];
};

const quad = (r: number, a: number, b: number, c: number, d: number) => {
  let vertices = [
    vec3(-r, -r, r),
    vec3(-r, r, r),
    vec3(r, r, r),
    vec3(r, -r, r),
    vec3(-r, -r, -r),
    vec3(-r, r, -r),
    vec3(r, r, -r),
    vec3(r, -r, -r),
  ];

  let vertexColors = [
    [0.0, 0.0, 0.0, 1.0], // black
    [1.0, 0.0, 0.0, 1.0], // red
    [1.0, 1.0, 0.0, 1.0], // yellow
    [0.0, 1.0, 0.0, 1.0], // green
    [0.0, 0.0, 1.0, 1.0], // blue
    [1.0, 0.0, 1.0, 1.0], // magenta
    [0.0, 1.0, 1.0, 1.0], // cyan
    [1.0, 1.0, 1.0, 1.0], // white
  ];

  //vertex color assigned by the index of the vertex
  const indices = [a, b, c, a, c, d];

  let points = [];
  let colors = [];
  for (let i = 0; i < indices.length; ++i) {
    points.push(vertices[indices[i]]);
    colors.push(vertexColors[a]);
  }

  return [points, colors];
};

export {
  random_rgba,
  rand_between,
  tri_from_coords,
  rect_from_coords,
  rect,
  sleep,
  colorCube,
};
