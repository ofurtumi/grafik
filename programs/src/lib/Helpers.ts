// Þorvaldur Tumi Baldursson
//
// Einföld en mjög gagnleg hjálparföll fyrir WebGL forritun
// ath. passa þegar þú breytir framtíðar Tumi, gæti brotið núverandi forrit

// Skilar tölu á bilinu [min, max)
import { vec2, vec4 } from "./MV";

const rand_between = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Skilar hnitum fyrir þríhyrning með miðju í (x, y) og stærð size
const tri_from_coords = (x: number, y: number, size = 0.5) => {
  let points = [
    vec2(x, y + size),
    vec2(x - size, y - size),
    vec2(x + size, y - size),
  ];

  return points;
};

// skilar slembi RGBA vektor, skemmtileg staðreynd, hundurinn minn heitir Vektor
const random_rgba = () => {
  return vec4(Math.random(), Math.random(), Math.random(), 1.0);
};

export { random_rgba, rand_between, tri_from_coords };
