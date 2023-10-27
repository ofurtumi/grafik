#import "@templates/ass:0.1.1": *

#show: doc => template(
  class: "TÖL105M",
  project: "Heimadæmi 6",
  doc
)

#set heading(numbering: "1.a.")

= N-faldur pendúll
#link("https://grafik.sjomli.is/h6/v1")[Linkur á verkefni]

Til að fá penúl hreyfingu notaðist ég við `Math.sin()` í samvinnu við `rotateZ` fallið úr MV.ts. Þetta gaf pendúlnum frekar náttúrulega hreyfingu á milli efsta punkts og andstæðu hans.

#align(center, grid(columns: 2, align(left + horizon, [
  Ég notaðist við grunn úr heimadæmi 5.1. 
  - Fyrst fjarlægði ég grunninn og efri tvo armanna
  - Næst snéri ég við kassanum sem stóð eftir og setti snúningsmiðju hans efst
  - Því næst skilgreindi ég global breytu sem innihélt staðsetningu og snúning
  - Ég ítraði upp snúningsbreytunni í hverri `render` ítrun og lét hana stjórna snúningi kassans]), image("../imgs/h6-v1.png", width: 80%)
))

Eftir þessi skref var ég kominn með einfaldan pendúl sem gat verið hvar sem er á skjánum, eftir það var einfalt að teikna fleiri pendúla útfrá þeim sem var fyrir ofan, það eina sem þurfti að passa var að staðsetning fylgdi neðsta punkt foreldrisins

= Phong eða Blinn-Phong
#link("https://grafik.sjomli.is/h6/v2")[Linkur á verkefni]

#grid(columns: (3fr, 1fr), [
Í þessu dæmi þurfti að bæta við nokkrum breytum inn í litarana, fyrst og fremst vigrinum R, reiknaður með formúlunni 
```glsl
// vertex shader
R = 2.0 * max(dot(L,N), 0.0) * N - L; 
```

og svo einni boolean breytu til þess að velja hvernig `Ks` er reiknað

```glsl
// fragment shader
uniform bool phong;
float Ks;
if (phong) {
  Ks = pow( max(dot(E, R), 0.0), shininess );
} else {
  Ks = pow( max(dot(normalize(N), H), 0.0), shininess );
}
vec4  specular = Ks * specularProduct;
```], align(horizon, [ #image("../imgs/h6-v2.png") #image("../imgs/h6-v2-b.png")]))

#pagebreak()
= Sakarias stóllinn, nú með ljósi
#link("https://grafik.sjomli.is/h6/v3")[Linkur á verkefni]

#grid(columns: 2, image("../imgs/h6-v3-a.png"), image("../imgs/h6-v3-b.png"))

= Tepottur með götum
#link("https://grafik.sjomli.is/h6/v4")[Linkur á verkefni]

== Breytileg gatastærð
Til þess að ná þessu fram þurfti að bæta við float uniform breytu í bútalitarann, þessi breyta var síðan notuð sem viðmið fyrir styrk ljóss sem henda átti út.

== Stækka, minnka, stækka, minnka...
Hér notuði ég voða svipaða aðferð og í dæmi 1. skilgreindi víðværa breytu sem var ítruð upp í hverri keyrslu render fallsins og sett inn í `Math.sin()`. 
Útkoman úr sin fallinu var síðan sett í `scalem` fallið þar sem búið var til skölunarfylki.

= Hið ótrúlega undraland gólfs og veggja
#link("https://grafik.sjomli.is/h6/v5")[Linkur á verkefni]

Ég lék mér pínu með þetta verkefni. Það tók frekar stuttan tíma að búa til auka veggina og loftið og í fyrstu tilraun skilgreindi ég bæði ný punkta- og litahnit fyrir hvern flöt sem ég teiknaði.

Þá var næsta skref að útfæra collision, upphaflega athugaði ég einfaldlega hvort núverandi stefna + stefnan næsta skref myndi taka mig út fyrir kassan og ef svo, ekki leyfa hreyfingu í þá átt.
Hinsvegar kom þetta í veg fyrir að ég gæti skilgreint op á kassanum þar sem ég kæmist út.

Ég þurfti því að endurhugsa áreksturs fallið mitt og endaði á því að athuga hvern vegg fyrir sig. Þetta er kannski örlítið dýrara í keyrslu en virkar mun betur því nú gat ég skilgreint veggi eins stóra eða litla og ég vildi.

Eftir það þurfti ég að endurhugsa hvernig ég teiknaði veggina mína, fyrst ég var búinn að skilgreina staðsetningu þeirra fyrir áreksturs fallið mitt þá nýtti ég mér þau gögn til að útfæra translation varpanir. Þetta leyfði mér líka að nota bara eitt sett af punkta- og litahnitum fyrir veggina mína.

Ég endaði líka á því að endurhugsa hvernig notandinn hreyfði myndavélina, ég reyndi að herma eftir dróna fjarstýringu þar sem annar stýripinnin stjórnar hreyfingu og hinn stefnu, þetta virkaði ágætlega og var bæði frekar snappy og einfalt í notkun þót ég segi sjálfur frá.

#grid(columns: 2,
  image("../imgs/h6-v5-a.png"),
  image("../imgs/h6-v5-b.png"),
  image("../imgs/h6-v5-c.png"),
  image("../imgs/h6-v5-d.png")
)
