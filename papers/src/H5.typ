#import "@templates/ass:0.1.1": *

#show: doc => template(
  class: "TÖL105M - Tölvugrafík",
  project: "Heimadæmi 5",
  doc
)

#set heading(numbering: "1.a.i -")

= Vélarmur
#link("https://grafik.sjomli.is/h5/v1")[Hér er linkur á verkefnið.] 

#grid(columns: 2, align(horizon, [
Armurinn leyfir mismikla hreyfingu á örmunum. Hreyfing fyrir þann neðsta liggur á milli $plus.minus 90°$, miðjuarmurinn snýst á milli $plus.minus 140°$ og sá síðasti og smæsti á milli $plus.minus 150°$.

Snúningurinn er klemmdur á milli ákveðinna gilda með eftirfarandi aðferð:]),
```ts
const clampTheta = (t: number, c: number) => {
  if (Math.abs(t) > c) {
    return Math.sign(t) * c;
  }
  return t;
};
```)

#grid(columns: 2, align(center, image("../imgs/h5-v1-a.png", width: 75%)), align(center, image("../imgs/h5-v1-b.png", width: 75%)))

= mouseLook
#link("https://grafik.sjomli.is/h5/v2")[Hér er linkur á verkefnið.] 

Ég útfærði þetta fall en það notar ekki alveg sömu útfærslu og ég mun skrifa hér.
Við þurfum að halda utan um staðsetningu spilara, `eye` vigurs, og við viljum að spilarinn horfi áfram.
Þetta þýðir að við þurfum að láta `at` vigurinn nýta einhverskonar vörpun útfrá `eye`.
Ef við myndum eingöngu vilja hreyfa okkur beint fram og aftur og til hliðar þá gætum við látið `at` vigurinn vera $"eye" + "vec3"(0,0,1)$.
En þar sem við viljum að spilarinn geti snúið sér þá þurfum við að nota snúning á `at` vigurinn.
Snúningurinn reiknast sem $cos(theta)$ fyrir $x$ og $sin(theta)$ fyrir $z$, við leggjum við eða drögum þessi gildi frá `eye` vigrinum og fáum þá nýju staðsetninguna okkar og `at` vigurinn verður nýji staðsetningarvigurinn + nýji vigurinn okkar.

```pseudo
lookAt(key, mdelta) {
  // reiknum nýja at
  switch(key) {
    w: { at = vec3(cos(mdelta),0, sin(mdelta))}
    s: { at = vec3(-cos(mdelta),0, -sin(mdelta))}
    a: { at = vec3(-cos(mdelta),0, sin(mdelta))}
    d: { at = vec3(cos(mdelta),0, -sin(mdelta))}
  }

  // uppfærum global satðsetningu
  eye += at
  at += eye

  return lookAt(eye, at, vec3(0,1,0))
}
```

= Phong
== Endurskin
=== Depilendurskin
Til þess að hámarka depilendurskin þá viljum við snúa fletinum þannig að hann spegli ljósinu beint aftur í auga áhorfandans. Til að hámarka þetta látum við vigrana $arrow(v)$, í átt til áhorfanda, og $arrow(r)$, endurskinsvigur ljósgjafa, uppfylla eftirfarandi:
$ cos^(-1)((arrow(r) dot arrow(v) ) / ( |arrow(r)|*|arrow(v)| )) = 0° $
#align(center, [ Hornið á milli þeirra er $0°$ ])

=== Dreifendurskin
Við vitum að að mött efni endurkasta ljósgeislum í allar áttir og að staðsetning áhorfanda með tilliti til ljósgjafa skiptir ekki máli.
Samkvæmt lögmáli Lamberts þá er styrkur endurkasts háður horni ljósgeislans, sé hornið beint niður á yfirborðið þá er mestur styrkur og því er minni styrkur ef ljósið skín með halla.

Til þess að hámarka dreifendurskin þá viljum við að ljósið dreifist yfir stórt svæði, ef við viljum aðeins nota halla flatarins til þess að ná þessu fram þá viljum við að hornið á milli ljóssins og endurskinins sé mjög hátt. Þetta er vegna þess að þegar hornið er stærra þá dreifist ljósorkan á stærra svæði og hver bútur fær minna ljós eða með öðrum orðum meiri dreifni.


== Fjarlægðir
Fjarlægð áhorfandans hefur áhrif á depilendurskin. Því nær sem áhorfandinn er, því minna verður hornið á milli áhorfandans og endurskinsins frá fletinum, þetta gerir það að verkum að depilendurskinið verður _"minna"_ eða öllu heldur meira fókusað.

Eins ef við látum áhorfandann vera langt frá fletinum þá verður depilendurskinið stærra og dreifðara. Þetta er af sömu ástæðu nema öfugt, áhorfandinn er lengra frá fletinum þannig að horn endurskinsvigursins verður stærra (víðara) en ef hann er nálægt.

Það á svipað við um fjarlægð ljósgjafans, því nær sem hann er því sterkari áhrif hefur hann á flötinn, þetta sést mest þar sem depilendurskinið verður _"fókusaðra"_. Því fjær sem ljósgafinn er því dreifðari verður öll lýsingin.
Þetta eru eru áhrif sem hægt er að sjá í raunveruleikanum, sólin er sjúklega langt í burtu og kastar yfirleitt mjög dreifðu og jöfnu ljósi um allt. 
Hinsvegar getur maður tekið ljós sem er mikið veikara en haft það mjög nálægt fletinum sem maður er að lýsa og þá kemur smá depilendurskin upp.

= Endurskin
Við höfum yfirborð sem er lýst með endurskinslíkani Phong með tveimur ljósgjöfum, $l_1$ og $l_2$. Það er enging dofnun á ljósgjöfunum og $l_2$ er tvöfalt lengra frá yfirborði en $l_1$.

== Bjartasta dreifendurskin útfrá $l_1$
Bjartasta dreifendurskin væri þar sem stærsta hornið er fyrir báða ljósgjafa.

== Bjartasta depilendurskinið útfrá $l_1$
Ef áhorfandinn er nákvæmlega á sama stað og ljósið $l_1$ þá fáum við horn á milli $arrow(v)$ og $arrow(r)$ sem er $0°$ og því depilendurskinið hámarkað á fletinum beint fyrir neðan áhorfandann.

== Bjartasta depilendurskinið útfrá $l_2$
Ef áhorfandinn er nákvæmlega á sama stað og ljósið $l_2$ þá fáum við horn á milli $arrow(v)$ og $arrow(r)$ sem er $0°$ og því depilendurskinið hámarkað á fletinum beint fyrir neðan áhorfandann eins og í $l_1$.

== Viðbætt annars stigs dofnun

== Staðsetjum áhorfanda
Ef við staðsetjum áhorfandna á milli ljósanna mjög nálægt fletinum þá fáum við depilendurskinið sem er hámarkað á fletinum beint fyrir neðan áhorfandann fyrir báða ljósgjafa.

= Tepotturinn
Verkefnið sjálft var í raun og veru ekki mjög flókið, megnið af tímanum fór að í að færa `teapotData.js` yfir í typescript því það var hægara sagt en gert. 

== Hreyfum ljós
Eftir allt brasið tengt `mouseLook()` þá bjóst ég við að lenda í svipaðri gryfju varðandi þessar hreyfingar, sem betur fer var þetta verkefni talsvert einfaldara og því var hægt að rumpa af frekar fljótt.

Í upprunalega sýnikóðanum vorum við með uniform breytuna `lightPosition` sem við stillum af einu sinni upphafsfallinu. Hreyfikóðinn snýst um að taka þessa breytu og setja staðsetningu hennar fyrir hverja keyrslu á `render()` fallinu. Við höfum svo event listener sem hlustar eftir lyklaborðinu og ef hann heyrir til dæmis upp örina þá hækkar hann `lightPosition.y` um $0.1$.

```ts
const keydown = (e: KeyboardEvent) => {
  if (["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
    desired_quality = parseInt(e.key);
  }

  switch (e.key) {
    case "ArrowLeft":
    case "a":
      lightPosition[0] -= 0.1;
      break;
    case "ArrowRight":
    case "d":
      lightPosition[0] += 0.1;
      break;
    case "ArrowDown":
    case "s":
      lightPosition[1] -= 0.1;
      break;
    case "ArrowUp":
    case "w":
      lightPosition[1] += 0.1;
      break;
  }
}
```

== Stillum gæði
Að skrifa yfir og teikna bara hluta af þeim hnútum sem eru inn í buffer gerðum við mikið í fyrstu vikunum.
Aðalatriðið er að við skrifum ekki of mikil gögn inn í buffer sem hefur ekki pláss fyrir þau.
Einfaldasta leiðin til að koma í veg fyrir það er að upphafsstilla bufferinn með _"stærstu"_ gögnunum, nú þegar við skrifum yfir næst þá getum við ekki skrifað of mikið.
Með þessari aðferð er líka mikilvægt að halda utan um fjölda hnúta sem á að teikna svo við teiknum ekki óvart hnúta sem tilheyra hlut í gæðaflokk fyrir ofan okkur.

Eftir að þetta var komið þurfti einfaldlega að smíða aðferð sem yfirskrifar bufferinn og kallar á hana þegar við smellum á einhvern af talnatökkunum.
Ég breytti skilgreiningunni á myTeapot þannig að núna sé hann víðvær breyta sem ég get breytt hvaðan sem er.

Næst skilgreindi ég tvær breytur til að halda utan um gæði, `desired_quality` og `current_quality`, þær byrja báðar sem 9. 
Ef við smellum á t.d. 2, þá verður `desired_quality = 2`. Við höfum þá if setningu í render fallinu sem athugar hvort `desired_quality` og `current_quality` séu jafngild, ef ekki, þá köllum við á nýja fallið okkar til að uppfæra bufferinn. 

```ts
const render = (gl: WebGLRenderingContext) => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (desired_quality !== current_quality) {
    current_quality = desired_quality;
    redo_tepot(current_quality, gl);
  }

...

const redo_tepot = (quality: number, gl: WebGLRenderingContext) => {
  myTeapot = teapot(quality);
  myTeapot.scale(0.5, 0.5, 0.5);
  num_points = myTeapot.TriangleVertices.length;
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    flatten(myTeapot.TriangleVertices),
    gl.STATIC_DRAW
  );
  if (!vPosition && vPosition !== 0) {
    console.error("No position");
    return;
  }
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(myTeapot.Normals), gl.STATIC_DRAW);

  if (!vNormal && vNormal !== 0) {
    console.error("No position");
    return;
  }
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);
}
```
