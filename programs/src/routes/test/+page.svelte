<script lang="ts">
  import {
    vec2,
    vec3,
    vec4,
    mat2,
    mat3,
    mat4,
    add,
    subtract,
    mult,
    translate,
    type matrix,
    perspective,
    lookAt,
    normalize,
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

  // matrix addition and subtraction
  let m_op_vals = new Array(4).fill(0);
  let v_op_vals = new Array(3).fill(0);
  let v4_op_vals = new Array(4).fill(0);

  $: m_op_val = mat2(...m_op_vals);
  $: v_op_val = vec3(...v_op_vals);
  $: v4_op_val = vec4(...v4_op_vals);
  const m_op_const = mat2(1, 2, 3, 4);

  $: t1 = translate(v3) as matrix;
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
    <div class="flex column">
      <p class="focus">vec2(...)</p>
      <Matrix matrix={v2} dimension={2} />
    </div>
    <div class="flex column">
      <p class="focus">vec3(...)</p>
      <Matrix matrix={v3} dimension={3} />
    </div>
    <div class="flex column">
      <p class="focus">vec4(...)</p>
      <Matrix matrix={v4} dimension={4} />
    </div>
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
    {#each m_op_vals as _, i}
      <Number bind:n={m_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={m_op_val} dimension={2} />
    <p>+</p>
    <Matrix matrix={m_op_const} dimension={2} />
    <p>=</p>
    <Matrix matrix={add(m_op_val, m_op_const)} dimension={2} />
  </div>
</div>

<div class="flex column divider">
  <h1>subtract(mv1, mv2)</h1>
  <div class="flex">
    {#each m_op_vals as _, i}
      <Number bind:n={m_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={m_op_val} dimension={2} />
    <p>-</p>
    <Matrix matrix={m_op_const} dimension={2} />
    <p>=</p>
    <Matrix matrix={subtract(m_op_val, m_op_const)} dimension={2} />
  </div>
</div>

<div class="flex column divider">
  <h1>mult(m1, m2)</h1>
  <div class="flex">
    {#each m_op_vals as _, i}
      <Number bind:n={m_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={m_op_val} dimension={2} />
    <p>*</p>
    <Matrix matrix={m_op_const} dimension={2} />
    <p>=</p>
    <Matrix matrix={mult(m_op_val, m_op_const)} dimension={2} />
  </div>
</div>

<div class="flex column divider">
  <h1>mult(m1, v1)</h1>
  <div class="flex">
    {#each m_op_vals as _, i}
      <Number bind:n={m_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={m_op_val} dimension={2} />
    <p>*</p>
    <Matrix matrix={vec2(1, 2)} dimension={2} />
    <p>=</p>
    <Matrix matrix={mult(m_op_val, vec2(1, 2))} dimension={2} />
  </div>
</div>

<div class="flex column divider">
  <h1>mult(v1, v2)</h1>
  <div class="flex">
    {#each m_op_vals.slice(0, -1) as _, i}
      <Number bind:n={m_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={vec3(...m_op_vals)} dimension={3} />
    <p>*</p>
    <Matrix matrix={vec3(1, 2, 3)} dimension={3} />
    <p>=</p>
    <Matrix matrix={mult(vec3(...m_op_vals), vec3(1, 2, 3))} dimension={2} />
  </div>
</div>

<div class="flex column divider">
  <h1>translate(v3)</h1>
  <div class="flex">
    {#each v_op_vals as _, i}
      <Number bind:n={v_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={v_op_val} dimension={3} />
    <p>=</p>
    <Matrix matrix={translate(v_op_vals)} dimension={4} />
  </div>
</div>

<div class="flex column divider">
  <h1>perspective(90, 1, 0.1, 100)</h1>
  <div class="flex">
    <Matrix matrix={perspective(90, 1, 0.1, 100)} dimension={4} />
  </div>
</div>

<div class="flex column divider">
  <h1>lookAt(v3, vec3(0,0,0), vec3(0,1,0))</h1>
  <div class="flex">
    {#each v_op_vals as _, i}
      <Number bind:n={v_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix
      matrix={lookAt(v_op_vals, vec3(0, 0, 0), vec3(0, 1, 0))}
      dimension={4}
    />
  </div>
</div>

<div class="flex column divider">
  <h1>normalize(v3)</h1>
  <div class="flex">
    {#each v_op_vals as _, i}
      <Number bind:n={v_op_vals[i]} />
    {/each}
  </div>
  <div class="flex">
    <Matrix matrix={normalize(v_op_vals)} dimension={2} />
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
