<script lang="ts">
  import type { matrix, vector } from "$lib/MV";
  import { isMatrix } from "$lib/MV";
  export let matrix: matrix | vector;
  export let dimension: number;
</script>

{#if !isMatrix(matrix)}
  <div
    class={matrix[0].toString().length > 5 ? "vector horizon" : "vector"}
    style="--dimension: {dimension}"
  >
    {#each matrix as item}
      <span>{item}</span>
    {/each}
  </div>
{:else}
  <div class="matrix" style="--dimension: {dimension}">
    {#each matrix as row}
      {#each row as item}
        <span>{item}</span>
      {/each}
    {/each}
  </div>
{/if}

<style>
  div {
    background: var(--bg);
    border: 5px solid var(--bg_h);
  }
  .matrix {
    display: grid;
    grid-template-columns: repeat(var(--dimension), 1fr);
    grid-template-rows: repeat(var(--dimension), 1fr);
    place-items: center;
    width: 200px;
    aspect-ratio: 1;
    padding: 1em;
  }

  .vector {
    display: grid;
    grid-template-rows: repeat(var(--dimension), 1fr);
    place-items: center;
    width: 100px;
    height: 200px;
    padding: 1em;
  }

  span {
    color: var(--c4);
    font-size: calc(200px / (var(--dimension) * 1.4));
  }

  .vector span {
    font-size: calc(200px / ((var(--dimension) + 1) * 1.4));
  }

  .horizon {
    gap: 0.5rem;
    height: 100px;
    width: 200px;
  }

  .horizon span {
    font-size: calc(200px / ((var(--dimension) + 1) * 1.6));
  }
</style>
