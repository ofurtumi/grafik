export interface CENTIPEDE {
  direction: number;
  head: Vector3;
  tail?: Vector3[];
  going_up?: boolean;
  next_up?: boolean;
  length: number;
  spheres?: Mesh[];
  color?: number;
}

export interface REMOVE {
  cent: CENTIPEDE;
  cent_index: number;
  index: number;
}

export interface MAP {
  height: number;
  width: number;
  map: number[][];
  mushrooms: THREE.Mesh[];
}

export interface PLAYER {
  pos: THREE.Vector3;
  follow: boolean;
  limits: { x1: number; x2: number; y1: number; y2: number };
  dead: number;
}

export interface BULLETS {
  alive: boolean[];
  delay: number;
  last_fired: number;
  speed: number;
}

export interface CENTIPEDES {
  to_remove: REMOVE | null;
  delay: number;
  speed: number;
  last_move: number;
}

export interface GAME {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  score: number;
  map: MAP;
  player: THREE.Mesh;
  centipedes: CENTIPEDE[];
  bullets: THREE.Mesh[];
  player_data: PLAYER;
  bullet_data: BULLETS;
  centipede_data: CENTIPEDES;
  frozen: boolean;
}
