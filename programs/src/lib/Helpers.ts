// Þorvaldur Tumi Baldursson
//
// Einföld en mjög gagnleg hjálparföll fyrir WebGL forritun
// ath. passa þegar þú breytir framtíðar Tumi, gæti brotið núverandi forrit

// Skilar tölu á bilinu [min, max)
import { vec2, vec4, type vector } from "./MV";

const rand_between = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

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

export { random_rgba, rand_between, tri_from_coords, rect_from_coords, rect };
