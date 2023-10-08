#import "@templates/ass:0.1.1": *

#show: doc => template(
  project: "Heimadæmi 4",
  class: "TÖL105M - Tölvugrafík",
  doc
)

#set heading(numbering: "1.a")

= Tvívíð vörpun
Til að gera þetta þurfum við að fylgja $T R S$ röðinni.
- Fyrst viljum við færa húsið yfir í $(0.0)$ það væri útfært með $"translate"(-10.0, -5.0, 0.0)$
- Næst snúum við húsinu $90$ gráður um z-ásinn, $"rotateZ"(90)$
- Næst síðast skölum við húsið niður um helming á x-ásnum með $"scale(0.5, 1.0, 1.0)"$
- Síðast færum við húsið aftur í uppranlegu hnitin með $"translate"(10.0, 5.0, 0.0)$

Nú höfum við röð aðgerða og hvað við þurfum að gera í hverri aðgerð.

$ P = (10, 5): f(P) = t(P(s(0.5, 1.0, 1.0)  * ("rZ"(90) * t(-P)))) $

= Tvívítt vörpunarfylki

== Hvað þýðir þetta eiginlega?
Ef við skoðum bara fyrstu tvo dálka og reiti fylkisins $mat(0,-1;1,0;)$ þá sjáum við að þetta er rangsælis snúningsfylki, síðan þurfum við að skoða seinustu tölurnar í hverju fylki $vec(1,1,1)$, þessar tölur saman tákna hliðrun um $(1,1)$

== Táknum þetta á þægilegri hátt
Nú vitum við hvað fylkið fyrir ofan gerir, setjum vörpunina fram á mannamáli.

- Fyrst hliðrum við til að fara yfir í miðju: $t(-P)$
- Næst snúum við rangsælis um 90 gráður: $r(90)$ 
- Þar næst förum við aftur á upphaflegu staðsetningu með $t(P)$
- Að lokum hliðrum við um $(1,1)$ upp og áfram með $t(1,1)$

við endum þá með fallið:
$ f(P) = t(1,1) * (t(P)  * (r(90) * t(-P))) $

#pagebreak()
= Samsett tvívíð vörpun
Við höfum vektor $V$ sem liggur frá $P_1$ til $P_2$

- Byrjum á að færa allt um $-P_1$ með $t(-P_1)$
- Finnum núna hornið á milli $P_1$ og $P_2$ með $theta = tan^(-1)(P_2_y - P_1_y / P_2_x - P_1_x)$
- Næst snúum við öllu $A$ um $theta$ gráður með $r(theta)$
- Núna viljum við spegla um x-ásinn, við gerum það með mirrorX()
  - $"mirrorX"() = mat(1,0;0,-1;)$
Nú höfum við spegluðu myndina og þurfum bara að snúa henni til baka og hliðra aftur um $P_1$.

Skref varpaninnar myndi þá líta svona:
#image("../imgs/h4-v2.png")


#pagebreak()
= IKEA auglýsing
#grid(columns: 2, image("../imgs/h4-v4.png"), image("../imgs/h4-v4-2.png"))
#align(center, link("https://grafik.sjomli.is/h4/v4", [Hér er linkur á þennan fallega, og hagstæði, stól]))

= Sólkerfi

#grid(columns: 2, image("../imgs/h4-v5.png"), image("../imgs/h4-v5-2.png"))
#align(center, link("https://grafik.sjomli.is/h4/v5", [Hægt að finna verkefnið hér]))
