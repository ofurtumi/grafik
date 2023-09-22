#import "@templates/ass:0.1.1": *

#show: doc => template(
  project: "Heimadæmi 3",
  class: "TÖL105M - Tölvugrafík",
  doc
)

#set heading(numbering: "1.a")

= Marglita þríhyrningur

```glsl
  precision mediump float;
  uniform float time;

  void
  main() {
    gl_FragColor = vec4(sin(time),cos(time),tan(time),1.0);
  }
```
#align(end, link("https://grafik.sjomli.is/h3/v1", [Hlekkur á verkefni hér]))

= Dönsku nýlendurnar

Báðir fánarnir nota sama kóða í grunninn, `varying vec4 v_color` breytu sem fær gildi útfrá staðsetningu í punktalitaranum og færist síðan yfir í bútalitarann.
== Grænland - #link("https://grafik.sjomlli.is/h3/v2-a", "hlekkur") 
#grid(columns: (2fr, 3fr), [
  #image("../imgs/h3-v2-a.png")
],[
#align(horizon,
    ```glsl
    ...
    if (tpos.x * tpos.x + tpos.y * tpos.y < 0.25) {
      v_color = vec4(1,0,0,1);
    } else {
      v_color = vec4(1,1,1,1);
    }

    if (tpos.y < 0.0) {
      v_color.yz = abs(v_color.yz - vec2(1,1));
    }
    ...
    ```
    )
  ]
)

== Ísland - #link("https://grafik.sjomlli.is/h3/v2-b", "hlekkur") 
#grid(columns: (2fr, 3fr),[
  #align(
    horizon,
    image("../imgs/h3-v2-b.png")
  )
],[
  ```glsl
  ...
  v_color = vec4(0,0,1,1);

  if (
    tpos.y < 0.3 && tpos.y > -0.3 ||
    tpos.x < 0.3 && tpos.x > -0.3) {
    v_color.xyz = vec3(1,1,1);

    if (
      tpos.y < 0.1 && tpos.y > -0.1 ||
      tpos.x < 0.1 && tpos.x > -0.1) {
      v_color.xyz = vec3(1,0,0);
    }
  }
  ...
  ```]
)

= Vigrar hafa stærð og stefnu

==
Við viljum tákna $[2,1] = x_1*[1,0] + x_2*[0,1]$ og það er ábyggilega fullt af leiðum til að reikna þetta út en þar sem þetta er einfalt dæmi sjáum við strax að $x_1 = 2$ og $x_2 = 1$

$ w=2*[1,0]+1*[0,1] $

==
Nú viljum við tákna $[2,1] = x_1*[3,3] + x_2*[1,-1]$ skiptum þessu nú upp í tvær jöfnur og fáum
$ 2 &= 3*x_1 + x_2\ 1 &= 3*x_1 - x_2 $

Þetta er einfalt jöfnuhneppisdæmi, leysum nú fyrir $3 = 6x_1 -> 3/6 = x_1 = 0.5$. Setjum núna $x_1$ inn í aðra jöfnuna og fáum $1 = 1.5 - x_2 -> x_2= 0.5$. Lokaniðurstaða:

$ w = 0.5*[3,3] + 0.5*[1,-1] $

= Punkt- og krossfeldi

== Punktfeldi
Reiknum punktfeldi af vigrunum $[a,b]$ og $[-b,a]$ og fáum $a*b-b*a = 0$ og þar sem við vitum að $cos(90) = 0$ þá getum við sagt að hornið milli vigranna sé $90$ gráður.

== Krossfeldi
Krossfeldi af vigur sem liggur samsíða x-ásnum og vigur sem liggur samsíða y-ásnum skilar vigur sem liggur samsíða z-ásnum, ef við breytum röð vigranna þá snýst stefnan á krossfeldinu.

== Horfum í spegil
Ef við krossfeldum vigur með sjálfum sér endum við með núll, þetta er vegna þess að $sin(theta)$ er partur af krossfeldisformúlunni og $sin(0) = 0$.

== Þrír á gatnamótum
#grid(columns: (2fr, 1fr), [
Við höfum tvo þrívíða vigra $v$ og $w$, þeir eru ekki samsíða og ekki hornréttir á hvorn annan. Við viljum búa til tvo vigra $s$ og $t$ þannig að $v, s, t$ séu allir hornéttir á hvorn annan.

Byrjum á að taka krossfeldi af upprunalegu vigrunum, fáum $s = v times w$ sem er þá hornréttur á bæði $w$ og $v$. 
Nú höfum við tvo vigra sem eru hornréttir á $z$ flötinni (heitir það það?) og við getum fundið krossfeldi af þeim og fengið $t = v times s$ sem liggur hornrétt á bæði $v$ og $s$.
],box(stroke: 2pt,image("../imgs/xyz.jpg")))

Ef þessir þrír vigrar eru látnir liggja saman fáum við mynd sem flestir þekkja, þar sem hver ás tilheyrir einum af þessum vigrum.

#pagebreak()
= #strike[break]out

#link("https://grafik.sjomli.is/h3/v5", [*Hægt að skoða verkefnið hér*])
#grid(columns: 3,
  image("../imgs/h3-v5.png"),
  image("../imgs/h3-v5-2.png"),
  image("../imgs/h3-v5-3.png")
)

Það virðist ekki mjög spennandi útfrá myndunum en forritið hefur þó nokkra skemmtilega eiginleika, ef spaðinn missir af boltanum og boltinn fer alveg niður í botn þá litast hann rauður. 
Notanda gefst býðst að bæði stjórna hraða og biðja um nýjann upphafsvigur á boltanum.
