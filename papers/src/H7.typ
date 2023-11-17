#import "@templates/ass:0.1.1": *

#show: doc => template(
  class: "TÖL105M",
  project: "Heimadæmi 7",
  doc
)

#set figure(supplement: [Mynd])

= Skoppbolti
#link("https://grafik.sjomli.is/h7/v1")[Hér er slóð á verkefnið]
#grid(columns: 2,
  figure( image("../imgs/h7-v1-32.png", width: 80%),caption:[Shadowmap size 32]),
  figure( image("../imgs/h7-v1-1024.png", width: 80%),caption:[Shadowmap size 1024])
)

#set heading(numbering: "1.a.i.")


= Texture atlas
*ATH. ég fattaði að ég víxlaði y ásnum en ég er búinn að eyða myndinni þannig nenni ekki að leiðrétta, notum bara ýmindunaraflið og látum y ásinn vera $1-"núverandi y-hnit"$*
== Hvers vegna eru texture atlas notuð
Ef við höfum marga hluti sem nota sömu mynstur þá getur það sparað okkur hellings i/o vinnu að hafa einungis eitt mynstur skjal sem þarf að sækja til að vinna með. Þá í stað þess að þurfa sækja nýja skrá fyrir hvert mynstur þá getum við vitnað í staðsetningu í atlasnum.

== Hvaða ókosti geta texture atlas haft?
Það þarf að passa vel að mynstur blæði ekki á milli hluta, þe. við þurfum að passa að staðsetningar okkar passi nákvæmlega við mynstrin inn í atlasnum.
Það getur líka verið ókostur að þurfa að hlaða inn öllum atlasnum ef maður þarf aðeins einn eða tvo hluti úr honum. Þetta vandamál væri þó hægt að koma í veg fyrir með flokkun.

== Hvernig vörpum við úr atlasnum?
Fyrir þetta dæmi höfum við atlas sem skipt er í fjögur mynstur. Þar sem við skiptum atlasnum aðeins í fjóra hluta er auðvelt að teikna þetta upp, sjá myndir 3 og 4.

#grid(
  columns: 2,
  figure(image("../imgs/h7-v2-a.png", width: 75%),caption:[Skipting á mynstrum]),
  figure(image("../imgs/h7-v2-b.png", width: 70%),caption:[Hnit 4. mynstursins])
)

Nú tökum við hnitin eins og í mynd 4 og vörpum þeim á rétta hornapunkta, $v_0=(0.5,0)$, $v_1=(1,0)$, $v_2=(0.5,0.5)$ og $v_3=(1,0.5)$.

= Mynsturvörpun
== Vandamál
=== Of lítið mynstur
Ef mynstur er of lítið fyrir hlutinn sem verið er að varpa því á getur það birsts sem teygt og/eða skakkt. Það fer eftir því hvaða stillingar eru settar í litara hvernig teygt er á mynstrinu. 

Ef mynstrið er sett upp þannig að það geti endurtekið sig væri hægt að vefja því utan um hlutinn án þess að fá voðalega vondar niðurstöður. Annars væri hægt að nota eitthvað eins og `MIRRORED_REPEAT` í webgl.

=== Of stórt mynstur
Ef mynstur er of stórt birtist það sem of skarpt og teygt á hluta hlutarins sem það ætti ekki að birtast á. Þetta er sérstaklega vandamál ef hluturinn er að snúa sér. Þá birtist mynsturinn sem teygt á hlutinn sem er að snúa sér og það getur birst á hlutinn sem er að snúa sér ekki.

Til að laga það að mynstrið sé of stórt má skala það niður og þá birtist það ekki eins skarpt. Það er þó mikilvægt að passa að mynstrið sé ekki of lítið því þá birtist það sem teygt og skakkt.

== Varpanir
#figure(image("../imgs/h7-v3-b-1.png"), caption: [$(-1.0, 0.0), (1.0, 0.0), (1.0, 2.0), (-1.0, 2.0)$])
#figure(image("../imgs/h7-v3-b-2.png"), caption: [$(0.0, 1.0), (2.5, 1.0), (2.5, 0.0), (0.0, 0.0)$])
#figure(image("../imgs/h7-v3-b-3.png"), caption: [$(1.0, 3.0), (0.0, 3.0), (0.0, 0.0), (1.0, 0.0)$])

= Litarar
== Kóði
=== Tilgangur coord breytunar
`coord` heldur utan um gefna staðsetningu sem er sett inn í litarann úr javascriptinu. Breytan er nýtt til að geta fært `vPosition` breytuna yfir í bútalitarann án þess að þurfa að gera það í js. Í bútalitaranum er coord breytan síðan notuð til að athuga hvort fjarlægð punkts frá miðju sé slétt tala, ef svo er hann litaður sérstaklega.

=== Teningur litaður með kóðanum
#grid(columns: 2,
[ Ef við teiknum tening af stærð $10 x 10 x 10$ þá vitum við að fletirnir sem eru beint út frá miðju teningsins eru grænir. Mynstrið byrjar síðan að sjást því fjær sem við förum beint út frá miðjunni og verður röndóttir hringir sem eru bæði grænir og rauðir til skiptis. ],
  figure(image("../imgs/h7-v4-a-ii.png", width: 50%), caption: [Dæmi um litun])
)

== Breyta lit yfir tíma
Við viljum bæta við uniform breytu sem heldur utan um tíma, köllum hana `time`. Við setjum inn í hana í javascriptinu með `Date.now()`. Við nýtum okkur síðan `time` í bútalitaranum til að leggja saman við `sumint`. Núna ættu hringirnir að hreyfast út á við.

= Gagnsæjir og ógagnsæjir hlutir
== A, B, C
Ef við teiknum C fyrst og það er fjærst þá erum við að skrifa í dýptarminnið það gildi, segjum að það sé $0.5$. C er eini ógagnsæji hluturinn svo næst getum við reiknað alpha blendnina. Röðin á A og B skiptir ekki máli þar sem þeir eru báðir gagnsæjir hlutir. 

== A, C, B
Nú er C í miðjunni og ætti þessvegna að blokka B. Við byrjum eins, teiknum C og setjum í dýptarminnið, næst athugum við hvort A sé fyrir framan C og þar sem það er reiknum blendnina, gerum síðan eins fyrir B nema hvað nú er B fyrir aftan C svo við þurfum ekki að gera neitt með það.
