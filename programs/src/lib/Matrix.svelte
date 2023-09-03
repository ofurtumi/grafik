<script lang="ts">
  export let matrix: number[][];
  export let dimension: number;
</script>

<div class="matrix" style="--dimension: {dimension}">
  {#each matrix as row}
    {#each row as item}
      <span>{item}</span>
    {/each}
  {/each}
</div>

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

  span {
    color: var(--c4);
    font-size: calc(200px / (var(--dimension) * 1.4));
  }
</style>
