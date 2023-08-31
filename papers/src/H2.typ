#import "../lib/info.typ": header
#header(2)

#set heading(numbering: "1.a)")
#set enum(numbering: "a)")
#show link: underline
#set figure(kind: "Test", supplement: "test")

#show figure: it => align(center, [
  #it.body
    #emph[Mynd #it.counter.display(it.numbering)] | #it.caption
])

#show raw.where(block: true): it => {
  block(
    width: 100%, 
    fill: luma(230), 
    stroke: 1pt,
    inset: 8pt,
    height: 100%,
    text(size: 0.8em, align(horizon, it)),
  )
}

#text(size: 0.8em, align(center, [ _ATH. allar myndir nema síðasta eru teknar á gömlu síðunni, uppfærði vefumhverfið í millitíðinni og gerði meira fancy_ ]))

= Breytingar á gasket
- Setja fyrsta punkt lengst út fyrir mörk þríhyrningsins
- Auka stærð á hverjum puntki
- Fækka punktum niður í 100 stykki

Nú má greinilega sjá að af og til birtast punktar fyrir utan mynstrið sem þeir ættu að fylgja. Þetta er vegna þess að punktarnir nota fyrsta punktinn sem viðmið og ef hann er ekki á réttum stað innan marka þríhyrningsins þá skekkja allir punktarnir sem fylgja honum.

#grid(columns: 3, gutter: 16pt,
  box(stroke: 2pt, inset: 4pt, image("../imgs/sierp-v2-1.png")), 
  box(stroke: 2pt, inset: 4pt, image("../imgs/sierp-v2-2.png")), 
  box(stroke: 2pt, inset: 4pt, image("../imgs/sierp-v2-3.png")), 
)

= Þrí- og ferhyrningar
Við ætlum að breyta því hvernig sýnidæmið teiknar þríhyrninga, við erum með gefna sex punkta sem eru notaðir til þess að teikna tvo samliggjandi þríhyrninga.

#grid(columns: (1fr, 1fr), gutter: 16pt, [
  == TRIANGLE_FAN
  Þessi aðferð getur nýtt hnúta oftar en einu sinni til þess að teikna myndir, hérna látum við hana hafa fjóra punkta _( sjá mynd 1 )_ sem ef teiknaðir einir og sér mynda ferhyrning.
  ],[
  == TRIANGLE_STRIP
  Ef ég skil þessa aðferð rétt þá teiknar hún þríhyrninga á milli síðustu þriggja punkta sem hún fékk gefins _( sjá mynd 3 )_. Hérna þarf því að passa röð hnúta nokkuð vel þar sem hún er ekki jafn sjálfgefin og fyrir TRIANGLE_FAN.
  ]) 
#grid(columns: 3, gutter: 16pt,
  figure(image("../imgs/tri-fan.png"), caption: [Sjá útkomu þessa fylkis #link("https://grafik.sjomli.is/h2/v2")[hér]]),
  figure(box(stroke: 2pt, image("../imgs/rect-v2-2.png") ), caption: [Báðar myndirnar líta alveg eins út og það er svona]),
  figure(image("../imgs/tri-strip.png"), caption: [Sjá útkomu þessa fylkis #link("https://grafik.sjomli.is/h2/v2")[hér]]),
)


= T að með TRIANGLE_STRIP
Ég byrjaði að teikna upp hnútana til að fá betra yfirlit yfir það tengiröðin ætti að vera, þetta tók smá tíma en ég held að það hafi verið fljótlegra heldur en að reyna gera þetta beint í höndunm, _( sjá mynd 4)_.

#grid(columns: (1fr, 1fr), gutter: 16pt, 
figure(image("../imgs/v2_road.png"), caption: [Hugsunarhátturinn á bakvið T-ið]),
figure(image("../imgs/t-strip.png"), caption: [Lokaútkoman]),
)

= Handahófskenndir þríhyrningar
== Fyrsta tilraun
Ég byrjaði á því að útfæra þrjú hjálparföll:
- `rand_between(max, min)`: skilar fleytitölu á billinu $["max", "min")$ 
- `tri_from_coords(x, y, size)`: skilar þríhyrningi með miðju í `(x, y)` og stærð `size`
- `random_rgb()` : skilar handahófskenndum lit á RGBA formi

Auk þeirra bætti ég við einni uniform breytu, `uniform vec4 fColor`,  inn í svæðalitaran sem vísað er í við teikningu. Svo notaði ég nýju föllin mín til að dæla þríhyrningum inn í fylki sem var síðan ýtrað yfir með þriggja skrefa hoppum. Í hverri ítrun var litafallið notað til að senda ferskan lit til svæðalitarans (fragment shader?). Sá kóði virkaði og litu mikilvægu hlutarnir svona út:

#grid(columns: (1fr, 1fr), rows: 12em, gutter: 8pt, 
  figure(
    ```js
    let tri = [];
    for (let i = 0; i < n_triangles; i++) {
      tri.push(
      ...tri_from_coords(
        rand_between(-1.0, 1.0), 
        rand_between(-1.0, 1.0), 
        0.05) 
      );
    }
    ```, 
    caption: [Uppsetning]
  ), figure(
    ```js
    for (let i = 0; i < tri.length; i += 3) {
      gl.uniform4fv(colorLoc, random_rgb());
      gl.drawArrays(gl.TRIANGLE_FAN, i, 3);
    }
    ```,
    caption: [Litun og teikning]
  )
)

#pagebreak()
== Seinni tilraun
Eftir að kóðinn fyrir ofan byrjaði að virka sá ég aukastigin og skellti mér í það. Tók mig smá tíma að finna út úr því en tóks að lokum.
Breytingar á kóðanum fyrir ofan voru ekki miklar en þó:
- Einfaldaði uppsetningarkóðann helling, núna er eru allir hnútar frumstilltir í miðju
- Bætti við nýrri uniform breytu, `uniform vec2 offset`, inn í punktalitarann sem er notaður til að hliðra hnútunum frá miðjunni

Nú eru það litararnir sem sjá um að hliðra þríhyrningunum frekar en uppsetningarferlið, hægt að sjá lokaútkomuna #link("https://grafik.sjomli.is/h2/v4/", [*hér*]).

#grid(columns: (1fr, 1fr), rows: 12em, gutter: 8pt, 
  figure(
    ```js
let tri = [];
for (let i = 0; i < n_triangles; i++) {
  tri.push(
    vec2(0, 0.05), 
    vec2(-0.05, -0.05), 
    vec2(0.05, -0.05)
  );
}
    ```, 
    caption: [Uppsetning]
  ), figure(
    ```js
for (let i = 0; i < tri.length; i += 3) {
  gl.uniform4fv(colorLoc, random_rgb());
  gl.uniform2fv(
    offsetLoc,
    vec2(
      rand_between(-1.0, 1.0), 
      rand_between(-1.0, 1.0))
    );
  gl.drawArrays(gl.TRIANGLE_FAN, i, 3);
}
    ```,
    caption: [Litun og teikning]
  )
)
\


= Sierpinski teppi
Þetta tók sinn tíma, mest af honum fór þó í að útbúa nýtt umhverfi fyrir forritin til að lifa í en slatti líka að smíða sjálft forritið. Ég notaði líka tækni úr `gasket5` til þess að geta séð teppið í mismunandi endurkvæmnis dýpt. Forritið má finna keyrandi #link("https://grafik.sjomli.is/h2/v5/", [*hér*]).

#figure(image("../imgs/sierpenski_teppi.png", width: 50%), caption: [útkoma á endurkvæmnis-dýpt 4])
