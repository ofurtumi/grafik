#import "@templates/ass:0.1.1":*

#show: doc => template(
  project: "Verkefni 2",
  class: "TÖL105M - Tölvugrafík",
  doc
)

#align(center, underline(link("https://grafik.sjomli.is/v2")[linkur á verkefnið]))

= Teikning
#grid(columns: (2fr, 1fr),
[
Það fyrsta sem ég tók fyrir í verkefninu var að teikna marga fiska. Þetta var vandamál sem við höfðum tæklað oftar en einu sinni í þessum áfanga en þó aldrei nákvæmlega á þennan máta. Við þurftum líka að geta vísað í, uppfært og lesið staðsetningu hlutanna sem við vorm að teikna. Ég safnaði saman þeim upplýsingum sem ég vissi að hver fiskur þyrfti til að synda og útbjó interface. Upphaflega innihélt þetta interface aðeins staðsetningu, lit og stefnu en verkefnið óx og interface-ið með því og ég endaði með eftirfarandi breytur.
],
```ts
interface fish_pos {
  current:    vector;
  direction:  vector;
  tail:       number;
  wag_offset: number;
  speed:      number;
  color:      vector;
}
```)
Ég útbjó svo fylki af 500 fiskum, þar sem þessar breytur voru upphafsstilltar með slembnum gildum. Fyrir hvern fisk sem átti að teikna var lesið úr fiskafylkinu tilheyrandi breytur og útfrá þeim reiknað vörpunarfylki fyrir fiskinn.

= Hreyfing
Undirstaða verkefnisins var að fiskarnir gætu hreyft sig útfrá stefnu og hraða. Nú höfðum við upplýsingar um báða þessa eiginleika fyrir alla fiska en við þurftum að flytja það yfir á strigan. Þetta var dæmi um hreyfivörpun, við tókum núverandi staðsetningu fisksins, bættum ofan á hana normalísaðri stefnu margfaldaða við hraða og fengum þannig nýja staðsetningu. Fisknum var síðan translate-að yfir í nýju stefnuna.
$ arrow(p)_"new" = arrow(p)_"old" + arrow(d) * s $
Ef fiskurinn var kominn að jaðri kassans þá var staðsetning hans sett sem speglun við núverandi staðsetningu.

#grid(columns: (2fr,1fr),
align(horizon,[ == Snúningur
Það tók mig vandræðalega langan tíma að snúa fiskunum mínum rétt í samræmi við stefnuna. Það tókst þó að lokum eftir að ég bjó til demo í tvívídd sem útfærði þessa lógík þ.e. hnútar sem höfðu staðsetningu og stefnu sem bentu í þá átt sem þeir stefndu. Ég notaði þetta demo síðan áfram í þróun á hjarðhegðun. ]),
image("../imgs/v2-demo.png")
)

== Hjarðhegðun
Kjarni verkefnisins var að láta fiskanna fylkjast saman eftir reglum um #underline(link("http://www.red3d.com/cwr/boids/")[hjarðhegðun]). Það var hellings bras að koma þessu af stað og ég þurfti að taka niður forritaragleraugun og setja upp stærðfræðigleraugun í staðinn. Loksins fór boltinn að rúlla og eftir að fyrsta reglan var komin þá fygldu hinar fljótt í kjölfarið.

Allar reglurnar notast við sama radíus til að leita að _gildum_ fiskum, köllum þá $G$, fyrir núverandi fisk, köllum hann $F$.
Auk þess enda þær allar á að útkomuvigur þeirra sé margfaldaðar með stillingarstuðli og bætt við hjarðvigurinum. Hjarðvigurinn er svo að lokum lagður við núverandi stefnu fisksins og normalíseraður.

#grid(columns: 3,
[=== Seperation
Fyrsta reglan snýst um að láta fiska forðast hvorn annan.

Við reiknum vigur frá $F$ og að $G$, því fjær sem $G_n$ er frá $F$ því lægra vægi hefur vigurinn.
Næst reiknum við meðalvigur þessara vægðu vigra og snúum honum við.],
[=== Alignment
Önnur reglan var líklega sú einfaldasta, hún snýst um að láta $F$ taka á sig örlítið af stefnu $G$.

Hérna þurfti einfaldlega að reikna meðalstefnu $G$ og skila henni sem vigur.],
[=== Cohesion
Þriðja reglan snýst um að reikna staðsetningu miðjunnar miðað við $G$.

Við finnum staðsetningu miðjunnar með því að reikna meðaltal staðsetninga $G$ og skila henni sem vigur.]
)

= Auka
Ég bætti nokkrum aukahlutum við verkefnið. Einn af aukahlutunum voru input á síðunna til að geta stillt ýmislegt bæði tengt fiskunum og hjarðhegðuninni. Annar aukahlutur var að láta fikana vera þrívíða, þeir nota núna aðeins fleiri hnúta og líta sjúklega vel út. Ofan á nýju teikninguna bætti ég líka við möguleika að teikna aðeins útlínur líkama fisksins þannig þeir verða gegnsæir sem kemur vel út.

= Niðurstaða
Verkefnið var mjög skemmtilegt, ágætlega stórt og mjög krefjandi á köflum. Ég lærði slatta á því og hlakka til að útfæra boids aftur í öðru máli eða vél.
