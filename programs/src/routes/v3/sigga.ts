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
 * SiggaProps
 * @param {string} texture - texture path
 * @param {number} color - hex color
 * @param {function} func - function to be called with the loaded object
 */
interface SiggaProps {
  texture?: string;
  color?: number;
  func: (obj: Group<Object3DEventMap>) => void;
}

/**
 * Sigga
 * Function that loads an avatar model
 */
export const Sigga = ({ texture, color, func }: SiggaProps) => {
  let loaded_texture: Texture;
  if (texture) {
    loaded_texture = new TextureLoader().load(texture);
  }
  const loader = new OBJLoader();

  loader.load(
    "/avatar.obj",
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
