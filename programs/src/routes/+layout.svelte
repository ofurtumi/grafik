<script lang="ts">
  const alt_names: { [key: string]: string } = {
    v1: "Frogger",
    test: "MV-TS",
  };
  const categories: string[] = ["Verkefni", "Heimadæmi", "Annað"];

  type TREE = { [key: string]: string[] };
  // aðferð frá vite til að fá skrár útfrá glob
  const links = Object.keys(import.meta.glob("./**"))
    .map((s) =>
      s
        .split("/+")[0] // splitt á +page.svelte
        .substring(1) // fjarlægja ./
        .split("/") // splitt á /
        .filter((s) => s !== "") // filtera út paths sem eru tómir
        .filter((s) => !s.includes(".json"))
    )
    .filter((s) => s.length > 0);

  let tree: TREE = {};
  links.forEach((link) => {
    if (tree[link[0]] === undefined) {
      tree = { ...tree, [link[0]]: [link[1]] };
    } else {
      tree[link[0]].push(link[1]);
    }
  });

  let sub_trees: TREE[] = [{}, {}, {}];
  Object.entries(tree).forEach((branch) => {
    if (branch[0].match(/h[0-9]/g)) {
      sub_trees[1][branch[0]] = branch[1];
    } else if (branch[0].match(/v[0-9]/g)) {
      sub_trees[0][branch[0]] = branch[1];
    } else {
      sub_trees[2][branch[0]] = branch[1];
    }
  });
</script>

<header>
  <h1>Yfirlit yfir verkefni úr TÖL105M - Tölvugrafík</h1>
  <h2>Þorvaldur Tumi Baldursson</h2>
</header>

<nav>
  {#each sub_trees as sub_tree, i}
    <div class="category">
      <h4>{categories[i]}</h4>
      {#each Object.entries(sub_tree) as branch}
        <div>
          {#if branch[1][0] === undefined}
            <h3>
              <a href={"/" + branch[0]}>
                {#if branch[0] in alt_names}
                  {alt_names[branch[0]]}
                {:else}
                  {branch[0]}
                {/if}
              </a>
            </h3>
          {:else}
            <h3>{branch[0]}</h3>
            <div class="branch">
              {#each branch[1] as link}
                <a href={`/${branch[0]}/${link}`}>{link}</a>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</nav>

<main class="flex column">
  <slot />
</main>

<style>
  header {
    text-align: center;
    grid-column: span 2;
    grid-row: 1;
  }

  nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: var(--border);
    gap: 1rem;
  }

  .category {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    padding-left: 2rem;
    gap: 1rem;
  }
  .category:not(:first-child) {
    border-top: var(--border);
  }

  main {
    overflow-y: scroll;
  }

  a {
    color: var(--blue);
    text-decoration: none;
    transition: var(--transition);
    width: fit-content;
  }

  a:hover,
  a:focus {
    color: var(--orange);
  }

  .branch {
    padding-left: 0.25rem;
    display: flex;
    flex-direction: column;
    font-size: 1.2rem;
  }

  .branch a:not(a:last-child)::before {
    content: "┠";
  }

  .branch a:last-child::before {
    content: "┗";
  }

  h3,
  h3 a {
    font-size: 1.3rem;
    color: var(--blue-dim);
  }
</style>
