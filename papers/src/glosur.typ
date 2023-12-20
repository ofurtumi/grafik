#import "@templates/ass:0.1.1": *

#show: doc => template(
  class: "TÖL-105M",
  project: "Glósublað",
  doc
)

#show math.equation: set text(font: "STIX Two Math")
#set heading(numbering: none)
#set figure(outlined: true, supplement: "Mynd")

#let note(heading, body, img: none, w: 50%) = {
  rect(
    inset: 8pt, 
    width: 100%, 
    {if img == none {
      [
        #align(center)[#heading]
        #text(size: 8pt, body)
      ]
    } else {
      align(center)[
        #heading
        #figure(image(img, width: w), caption: text(size: 8pt, body))
      ]
    }}
  )
}

#set grid(columns: 2, gutter: 6pt)
#show: rest => columns(2, rest)

#note(
  [ Snúum punkti rangsælis um horn $theta$ ],
  $R(x,y,theta) = cases(x': x cos(theta) - y sin(theta), y': x sin(theta)  +y cos(theta))$, img: "../imgs/prof_rotate_theta.png"
)

#note(
  [ Skjáhnit yfir í heimsnit, mús í litara\ _#text(size: 8pt)[ath: skjáhnit eru tv:(0,0) og bh: (h,w) ]_ ],
  $ (x,y) = cases(x': ( 2*x_w )/w - 1, y': (2*(h-y_w))/h-1) $
)

#note(
  [Innfeldi _(dot product)_],
  [ 
    Skilar horni á milli tveggja vigra, ef vigrarnir eru _normalized_ þá þarf ekki að reikna lengd þeirra inn:
    $u dot v = |u||v|cos(theta)$
  ], img: "../imgs/prof_dot_product.png"
)

#note(
  [Krossfeldi _(cross product)_\ _#text(size: 8pt)[ath: bara til í þrívídd]_],
  [ Tekur tvo ósamsíða vigra og skilar vigri sem er hornréttur á báða vigrana], img: "../imgs/prof_cross_product.png"
)

#note(
  [Hliðrun _(translation)_\ _#text(size: 8pt)[viðsnúningur: T(-t_x, )]_],
  [$ T(t_x, t_y, t_z) = mat(1,0,0,t_x;0,1,0,t_y;0,0,1,t_z;0,0,0,1) $]
)

#note(
  [Kvörðun _(scaling)_\ _#text(size: 8pt)[viðsnúningur: $S(1/s_x, 1/s_y, 1/s_z)$]_],
  [ $ S(s_x, s_y, s_z) = mat(s_x,0,0,0;0,s_y,0,0;0,0,s_z,0;0,0,0,1) $ ]
)

#note(
  [Snúningur _(rotation)_\ _#text(size: 8pt)[ath: alltaf um núllpunkt, viðsnúningur: $R_x (-theta)$]_],
  [
    $ R_x(theta) = mat(1,0,0,0;0,cos(theta),-sin(theta),0;0,sin(theta),cos(theta),0;0,0,0,1) $
    $ R_y(theta) = mat(cos(theta),0,sin(theta),0;0,1,0,0;-sin(theta),0,cos(theta),0;0,0,0,1) $
    $ R_z(theta) = mat(cos(theta),-sin(theta),0,0;sin(theta),cos(theta),0,0;0,0,1,0;0,0,0,1) $
  ]
)

#note(
  [Speglun _(reflection)_\ _#text(size: 8pt)[til að spegla um x-ás, snúum við hnitum hinna ásana við osfr.]_],
  [$ R_x = mat(1,0,0,0;0,-1,0,0;0,0,-1,0;0,0,0,1) $]
)

#note(
  [Arkitektúr robot arm],
  [ 
    Þrír hlutar, base, lower arm og upper arm.
    Base fær vörpunina $R_b$,
    lower arm fær hliðrun og snúning útfrá base ásamt eigin snúning: $R_b T_"b-height" R_l$,
    upper arm fær hliðrun og snúning útfrá base og la ásamt eigin snúning: $R_b T_"b-heigth" R_l T_"l-height" R_u$
    ```ts
    mvm = rotateY(theta[Base]);
    base(gl);
    // BH = 2 (base height)
    mvm *= translate((0.0, BH, 0.0)))
    mvm *= rotateZ(theta[LowerArm])
    lowerArm(gl);
    ```
  ]
)

#note(
  [Endurskinslíkan Phong\ _#text(size: 8pt)[notar 4 vigra í punktinum $P$]_],
  [ 
    $ r=2(l dot n)n-1 $
    #grid(
      columns: 2,
      [
        - $n$: þvervigur yfirborðs í $P$
        - $l$: vigur frá $P$ til ljóss
      ],[
        - $v$: vigur í átt að áhorfanda
        - $r$: endurskinsvigur
      ]
    )
  ]
)

#note(
  [Umhverfisendurskin],
  [ 
    $ I_a = k_a L_a $
    #grid(columns: 2, [
      $k_d$: magn endurkasts $0 <= k_d <= 1$],[ 
      $L_a$: styrkur ljóss]
    )
  ]
)


#note(
  [Dreifendurskin\ _#text(size: 8pt)[ath: endurskin á ljósi, ekki endurskin á yfirborði]_],
  [ 
    $ I_d = k_d (l dot n) L_d $
    #grid(columns: 2,
      [$k_d$: magn endurkasts $0 <= k_d <= 1$],
      [$L_d$: styrkur ljóss],
      [$l$: ljósvigur],
      [$n$: þvervigur _(upp)_]
    )
    #align(center)[Styrkur ljóssins mestur þar sem horn milli $l$ og $n$ er minnst, aka á sléttum flöt beint fyrir neðan ljósgjafann]
  ]
)

#note(
  [Depilendurskin],
  [ 
    $ I_s = k_s L_s cos^alpha phi $
    #grid(
      [$phi$: horn milli $v$ og $r$ _(sjá phong)_],
      [$k_s$: endurkast $0 <= k_s <= 1$],
    )
    $alpha$: glansstuðull, lágt $alpha$ stór daufur depill hátt $alpha$ lítill bjartur
    
    Má líka reikna sem $I_s=k_s L_s (r dot v)^alpha$ ef $|r| = 1$ og $|v| = 1$

    #align(center)[Sterkast þar sem $r$ og $v$ eru sami vigur, þ.e.a.s. $r dot v = 1$]
  ]
)

#note(
  [Dofnun],
  [
    #grid(columns: (1fr, 2fr),
      $ 1/(a+b d+c d^2) $,
      [
        - $d$: fjarlægð ljósgjafa frá yfirborði
        - $a,b,c$: fastar til að stýra dofnun
      ]
    )
  ]
)

#note(
  [Heildarformúla Phong endurskins],
  [$I = 1/(a+b d+c d^2) ( I_d + I_s ) + I_a$],
  img: "../imgs/prof_phong_reflection.png", w: 105%
)

#note(
  [Blinn- phong depilendurskin],
  [
    $ I_s = k_s L_s (n dot h)^beta $
    Skiptir formúlunni fyrir depilendurskin og út fyrir hagkvæmari en ónákvæmari formúlu, $beta$ þarf að vera stærra en $alpha$ til að fá sömu niðurstöðu og úr klassísku phong
    
    $h$: hálfvigur ljóss og áhorfanda, reiknað með $( l+v )/( |l+v| )$
  ]
)

#note(
  [Staðvær vs víðvær lýsing],
  [Phong og allt það eru staðvær módel, þau taka ekki mark á því sem er í umhverfinu og því þarf að nota margar ljósgjafir til að fá góða lýsingu. Víðvær módel taka mark á því sem er í umhverfinu og því þarf aðeins að nota eina ljósgjafa, geta líka gefið skugga.]
)

#note(
  [Mynstur],
  [
    - UV hnit, ná frá toppi vinstra *(0,0)* til neðra hægra *(1,1)*
    - *REPEAT*, *MIRRORED_REPEAT* og *CLAMP_TO_EDGE*
  ]
)

#note(
  [Margföldun fylkja],
  align(center)[#image("../imgs/prof_matrix_multi.png", width: 75%)]
)

#note(
  align(center)[Tveir ljósgjafar, engin dofnun],
  stack(
    spacing: 6pt,
    figure(
      image("../imgs/prof_ljos_1.png", width: 80%),
      caption: "Bjartasta dreifendurskin væri undir báðum ljósgjöfum, fjarlægð skiptir ekki máli"
    ),
    figure(
      image("../imgs/prof_ljos_2.png", width: 80%),
      caption: [Fyrir áhorfanda í $l_1$ eru tveir jafnbjartir  deplar, annar frá $l_1$ beint undir $l_1$ og hinn frá $l_2$ örlítið til hliðar við miðju því þar eru $r_2 dot l_2 = 1$]
    ),
    figure(
      image("../imgs/prof_ljos_3.png", width: 80%),
      caption: [Fyrir áhorfanda í $l_2$ er svipuð staða, frá $l_2$ beint undir $l_2$ og frá $l_1$ til hliðar við miðju: $r_1 dot l_1 = 1$]
    ),
    [],
    [Ef það væri dofnun væri bjartasti punktur séð frá $l_1$ beint undir og frá $l_2$ örlítið til hliðar við miðju.]
  )
)