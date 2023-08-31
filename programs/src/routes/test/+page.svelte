<script lang="ts">
  import { vec2, vec3, vec4, mat2, mat3, mat4 } from "$lib/MV";
  import Matrix from "$lib/Matrix.svelte";
  import Number from "$lib/Number.svelte";
  let [a, b, c, d]: number[] = new Array(4).fill(undefined);

  let values = new Array(4).fill(undefined);
  $: v2 = vec2(values[0], values[1], values[2], values[3]);
  $: v3 = vec3(values[0], values[1], values[2], values[3]);
  $: v4 = vec4(values[0], values[1], values[2], values[3]);
  $: m2 = mat2(values[0], values[1], values[2], values[3]);
  $: m3 = mat3(values[0], values[1], values[2], values[3]);
  $: m4 = mat4(values[0], values[1], values[2], values[3]);

  const U = (x: number | undefined) => (x === undefined ? "U" : x);
</script>

<div class="main-container">
  <div class="flex-column">
    <h1>Values</h1>
    <div class="flex">
      {#each values as val}
        <Number bind:n={val} />
      {/each}
    </div>
  </div>

  <div class="flex-column">
    <h1>Vector functions</h1>
    <div class="flex-evenly" style="font-size: 1.2rem;">
      <p>
        vec2(...) = {v2}
      </p>
      <p>
        vec3(...) = {v3}
      </p>
      <p>
        vec4(...) = {v4}
      </p>
    </div>
  </div>

  <div class="flex-column" style="margin-top: 2rem;">
    <h1>Matrix functions</h1>

    <div class="flex">
      <div class="matrix_cell">
        <Matrix matrix={m2} dimension={2} />
        <p>mat2({U(a)}, {U(b)}, {U(c)}, {U(d)})</p>
      </div>

      <div class="matrix_cell">
        <Matrix matrix={m3} dimension={3} />
        <p>mat3({U(a)}, {U(b)}, {U(c)}, {U(d)})</p>
      </div>

      <div class="matrix_cell">
        <Matrix matrix={m4} dimension={4} />
        <p>mat4({U(a)}, {U(b)}, {U(c)}, {U(d)})</p>
      </div>
    </div>
  </div>
</div>

<style>
  .main-container {
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rem;

    align-items: center;
    margin: 2em auto;
  }

  .flex,
  .flex-column,
  .flex-evenly {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1em;
  }

  .flex-column {
    flex-direction: column;
  }

  .flex-evenly {
    justify-content: space-between;
  }

  .matrix_grid {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .matrix_cell {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
