<script lang="ts">
  import {
    type matrix,
    vec2,
    vec3,
    vec4,
    mat2,
    mat3,
    mat4,
    add,
    subtract,
  } from "$lib/MV";
  import Matrix from "$lib/Matrix.svelte";
  import Number from "$lib/Number.svelte";

  let values = [
    new Array(4).fill(0),
    new Array(4).fill(0),
    new Array(4).fill(0),
    new Array(4).fill(0),
  ];

  $: v2 = vec2(...values[0], ...values[1], ...values[2], ...values[3]);
  $: v3 = vec3(...values[0], ...values[1], ...values[2], ...values[3]);
  $: v4 = vec4(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m2 = mat2(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m3 = mat3(...values[0], ...values[1], ...values[2], ...values[3]);
  $: m4 = mat4(...values[0], ...values[1], ...values[2], ...values[3]);

  // matrix addition
  let m_add_1 = mat2(1, 2, 3, 4);
  let m_add_2 = mat2(2, 3, 4, 5);
  const m_add_out: matrix = add(m_add_1, m_add_2) as matrix;

  // matrix subtraction
  let m_sub_1 = mat3(1, 2, 3, 4, 5, 6, 7, 8, 9);
  let m_sub_2 = mat3(0, 1, 2, 3, 4, 5, 6, 7, 8);
  const m_sub_out: matrix = subtract(m_sub_1, m_sub_2) as matrix;
</script>

<p>
  Tól til að prófa aðferðir úr gefna forritunarsafninu <code>MV.js</code> eftir að
  þær hafa verið færðar yfir í typscript
</p>
<div class="values flex column start divider">
  <h1>Gildi</h1>
  <p>
    Ath. stök fylkjanna svara ekki endilega til stöðu gildana fyrir neðan, þau
    eru sett inn í röð þ.e. 2d fylkið samsvarar fyrstu röð, ekki fyrstu tveimur
    dálkum í fyrstu tveimur röðum
  </p>
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

<div class="flex column evenly divider">
  <h1>Útkoma vecN() aðferða</h1>
  <div class="flex">
    <p class="focus">
      vec2(...) = {v2}
    </p>
    <p class="focus">
      vec3(...) = {v3}
    </p>
    <p class="focus">
      vec4(...) = {v4}
    </p>
  </div>
</div>

<div class="flex column divider">
  <h1>Útkoma matN() aðferða</h1>

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

<div class="flex column divider">
  <h1>add(mv1, mv2)</h1>
  <div class="flex">
    <Matrix matrix={m_add_1} dimension={2} />
    <p>+</p>
    <Matrix matrix={m_add_2} dimension={2} />
    <p>=</p>
    <Matrix matrix={m_add_out} dimension={2} />
  </div>
</div>

<div class="flex column divider">
  <h1>subtract(mv1, mv2)</h1>
  <div class="flex">
    <Matrix matrix={m_sub_1} dimension={3} />
    <p>-</p>
    <Matrix matrix={m_sub_2} dimension={3} />
    <p>=</p>
    <Matrix matrix={m_sub_out} dimension={3} />
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

  .divider {
    width: 100%;
    border-top: var(--border);
  }

  .focus {
    font-size: 1.2rem;
  }

  p {
    max-width: 500px;
    text-align: center;
  }
</style>
