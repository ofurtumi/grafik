<script lang="ts">
  export let n: number;
  const update = (x: number) => {
    if (n === undefined) n = 0;
    else n += x;
  };
  const fancy = (value: number) => {
    return value === undefined ? "U" : value;
  };
  $: n;
</script>

<div class="container">
  <button class="reset" on:click={() => (n = undefined)}>RESET</button>
  <button
    class="minus"
    on:click={() => {
      update(-1);
    }}>-1</button
  >
  <span>{fancy(n)}</span>
  <button
    class="plus"
    on:click={() => {
      update(1);
    }}>+1</button
  >
</div>

<style>
  .container {
    font-size: 1.2em;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 6em;
    aspect-ratio: 1;
  }

  button,
  span {
    font-size: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    border: var(--border);
    background: var(--bg);
    padding: 0.25em;
    color: var(--fg);
    transition: background 0.1s ease-in-out;
  }

  button:hover {
    cursor: pointer;
    background: var(--bg1);
  }

  .reset {
    color: var(--red);
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .plus {
    color: var(--green);
  }
  .minus {
    color: var(--yellow);
  }
</style>
