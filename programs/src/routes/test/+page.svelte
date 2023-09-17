<script lang="ts">
  import { vec2, vec3, vec4, mat2, mat3, mat4 } from "$lib/MV";
  import Matrix from "$lib/Matrix.svelte";
  import Number from "$lib/Number.svelte";

  let values = [
    new Array(4).fill(undefined),
    new Array(4).fill(undefined),
    new Array(4).fill(undefined),
    new Array(4).fill(undefined),
  ];

  $: v2 = vec2(...values[0], ...values[1], ...values[2], ...values[3]);
  $: v3 = vec3(...values[0], ...values[1], ...values[2], ...values[3]);
  $: v4 = vec4(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m2 = mat2(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m3 = mat3(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m4 = mat4(...values[0], ...values[1], ...values[2], ...values[3]);
</script>

<p>
  Tól til að prófa aðferðir úr gefna forritunarsafninu <code>MV.js</code> eftir að
  þær hafa verið færðar yfir í typscript
</p>
<div class="values flex column start">
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

<div class="flex evenly">
  <div class="flex column evenly vecs">
    <h1>Vector functions</h1>
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

  <div class="flex column">
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
  h1 {
    margin: 1rem 0;
  }

  .values {
    grid-column: 1 / span 5;
    grid-row: 1;
  }

  .evenly {
    gap: 2rem;
  }

  .vecs {
    height: 100%;
  }

  .matrix_cell {
    display: flex;
    gap: 1rem;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .vecs p {
    font-size: 1.2rem;
    align-self: flex-start;
  }
</style>
