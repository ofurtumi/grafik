<script lang="ts">
  import Card from "./cmp/Card.svelte";
  import Counter from "./cmp/Counter.svelte";
  import TabList from "./cmp/TabList.svelte";
  import Tab from "./cmp/Tab.svelte";
  import TabPanel from "./cmp/TabPanel.svelte";
  import Tabs from "./cmp/Tabs.svelte";
</script>

<main>
  <h1>Yfirlit yfir verkefni úr TÖL105M - Tölvugrafík</h1>
  <h2>Þorvaldur Tumi Baldursson</h2>

  <Tabs>
    <TabList>
      <Tab>one</Tab>
      <Tab>two</Tab>
      <Tab>three</Tab>
    </TabList>

    <TabPanel>
      <iframe src="./webGL/v1/" frameborder="0" allowfullscreen />
    </TabPanel>

    <TabPanel>
      <h2>Second panel</h2>
    </TabPanel>

    <TabPanel>
      <h2>Third panel</h2>
    </TabPanel>
  </Tabs>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
</style>
