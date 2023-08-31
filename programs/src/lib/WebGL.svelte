<script lang="ts">
  import { onMount } from "svelte";
  import initShaderProgram from "./WebGLUtils";
  let canvas: HTMLCanvasElement;
  export let vs: string;
  export let fs: string;
  export let buffer: (
    gl: WebGLRenderingContext,
    prog: WebGLProgram | null | undefined
  ) => void;
  export let render: (gl: WebGLRenderingContext) => void;

  onMount(() => {
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (!gl) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      return;
    }

    const shaderProgram = initShaderProgram(gl, vs, fs);
    buffer(gl, shaderProgram);

    if (!shaderProgram) return;
    gl.useProgram(shaderProgram);

    render(gl);
  });
</script>

<canvas bind:this={canvas} id="glcanvas" width="500" height="500" />

<style>
  canvas {
    border: var(--border);
    margin: auto;
    max-width: 500px;
    max-height: 500px;
  }
</style>
