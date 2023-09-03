<script lang="ts">
  import { vec2, vec3, vec4, mat2, mat3, mat4 } from "$lib/MV";
  import Matrix from "$lib/Matrix.svelte";
  import Number from "$lib/Number.svelte";

  //let values = new Array(4).fill(new Array(4).fill(0));
  let values = [
    new Array(4).fill(undefined),
    new Array(4).fill(undefined),
    new Array(4).fill(undefined),
    new Array(4).fill(undefined),
  ];
  const getValues = () => values.flat();
  $: values && console.log(...getValues());
  $: v2 = vec2(...values[0], ...values[1], ...values[2], ...values[3]);
  $: v3 = vec3(...values[0], ...values[1], ...values[2], ...values[3]);
  $: v4 = vec4(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m2 = mat2(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m3 = mat3(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m4 = mat4(...values[0], ...values[1], ...values[2], ...values[3]);
</script>

<div class="main-container">
  <div class="flex-column">
    <h1>Values</h1>
    <div class="flex-column">
      {#each values as row}
        <div class="flex row">
          {#each row as val}
            <Number bind:n={val} />
          {/each}
        </div>
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
      </div>

      <div class="matrix_cell">
        <Matrix matrix={m3} dimension={3} />
      </div>

      <div class="matrix_cell">
        <Matrix matrix={m4} dimension={4} />
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

  .matrix_cell {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
