// Þorvaldur Tumi Baldursson
//
// Einföld en mjög gagnleg hjálparföll fyrir WebGL forritun
// ath. passa þegar þú breytir framtíðar Tumi, gæti brotið núverandi forrit

// Skilar tölu á bilinu [min, max)
const rand_between = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Skilar hnitum fyrir þríhyrning með miðju í (x, y) og stærð size
const tri_from_coords = (x, y, size = 0.5) => {
  let points = [
    vec2(x, y + size),
    vec2(x - size, y - size),
    vec2(x + size, y - size),
  ];

  return points;
};

// skilar slembi RGBA vektor, skemmtileg staðreynd, hundurinn minn heitir Vektor
const random_rgb = () => {
  return vec4(Math.random(), Math.random(), Math.random(), 1.0);
};
