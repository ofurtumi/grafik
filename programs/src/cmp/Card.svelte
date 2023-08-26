<script lang="ts">
  export let title: string;
  export let week: string;
  export let description: string;

  const open_modal = (e: Event) => {
    console.log(e);
  };
</script>

<div class="card">
  <div class="head">
    <h3>{title}</h3>
    <span>{week}</span>
  </div>
  <p>{description}</p>
  <button on:click={open_modal}>Lesa meira</button>
</div>

<style>
  .card {
    color: var(--t-1);
    display: flex;
    padding: 1.5em;
    flex-direction: column;
    width: 250px;
    aspect-ratio: 2/1;
    align-items: flex-start;
    border-radius: 1em;
    background-color: var(--c-2);
  }

  .head {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--t-1);
  }

  .card p {
    flex-grow: 1;
  }

  button {
    width: 100%;
  }
</style>
