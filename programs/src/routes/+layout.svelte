<script lang="ts">
  type TREE = { [key: string]: string[] };
  const links = Object.keys(import.meta.glob("./**"))
    .map((s) =>
      s
        .split("/+")[0]
        .substring(1)
        .split("/")
        .filter((s) => s !== "")
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

  console.log(tree);
</script>

<header>
  <h1>Yfirlit yfir verkefni úr TÖL105M - Tölvugrafík</h1>
  <h2>Þorvaldur Tumi Baldursson</h2>
</header>

<section>
  <nav>
    {#each Object.entries(tree) as branch}
      <div>
        {#if branch[1][0] === undefined}
          <h3>
            <a href={"/" + branch[0]}>
              {branch[0]}
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
  </nav>

  <div class="flex-column">
    <slot />
  </div>
</section>

<style>
  header {
    text-align: center;
  }
  section {
    height: 100%;
    display: flex;
  }

  nav {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 10rem;
    border-right: var(--border);
    padding: 1rem;
    gap: 2rem;
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

  .flex-column {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
    padding: 1rem;
  }

  @media screen and (min-width: 700px) {
    .flex-column {
      justify-content: center;
    }
  }
</style>
