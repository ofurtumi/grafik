import {
  TextureLoader,
  type Object3DEventMap,
  Group,
  Texture,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

/**
 * @param {string} model - relative static directory path to model
 * @param {string} texture - relatice static directory path to texture
 * @param {number} color - hex color
 * @param {function} func - function to be called when the object has loaded, assign the object to a variable
 */
interface OBJProps {
  model: string;
  texture?: string;
  color?: number;
  func: (obj: Group<Object3DEventMap>) => void;
}

/**
 * Function that loads a given OBJ model
 *
 * Usage:
 * <pre>
 * import { OBJ } from './OBJ';
 * let new_obj: Group<Object3DEventMap>; // fyrst we define an object
 *
 * // then we call function with an arg function that assigns to the defined object
 * OBJ({
 *   model: "/avatar.obj",      // required
 *   texture: "/sigga.png",     // not required
 *   color: 0xff0000,           // not required
 *   func: (obj) => {           // required
 *     obj = new_obj;
 *   },
 * });
 * </pre>
 */
export const OBJ = ({ model, texture, color, func }: OBJProps) => {
  let loaded_texture: Texture;
  if (texture) {
    loaded_texture = new TextureLoader().load(texture);
  }
  const loader = new OBJLoader();

  loader.load(
    model,
    (obj) => {
      obj.traverse((child) => {
        if (child instanceof Mesh) {
          const material = new MeshStandardMaterial();
          if (texture) {
            material.map = loaded_texture;
          }
          if (color) {
            material.color.setHex(color);
          }
          child.material = material;
        }
      });
      func(obj);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error(`Error loading model: ${error}`);
    },
  );
};
