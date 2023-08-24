#import "../lib/info.typ": header
#header(1)

#set heading(numbering: "1.a)")
#set enum(numbering: "a)")
#show link: underline

#show figure: it => align(center, [
  #it.body
    #emph[Mynd #it.counter.display(it.numbering)] | #it.caption
])

= Kúlur og þríhyrningar
Ef við byrjum á að skipta kúlu upp í sneiðar með því að teikna línur frá norðurpól yfir á suðurpól með jöfnu millibili. Teiknum síðan línur í gegnum miðbaug og fleiri með jöfnu millibili í átt að báðum pólunum. Við sjáum það strax þegar við teiknum miðbaugin að við erum komin með nokkurskonar kúlu gerða úr þríhyrningum. Með því að auka fjölda bæði lengdar og breiddarbaugana skiptist hringurinn meira upp og verður meiri og meiri kúla. Við getum síðan skipt ferningunum sem myndast í tvennt og þá endum við með _"kúlu"_ úr engu nema þríhyrningum.

#figure(
  image("../imgs/v1_spheres.png"),
  caption: [Skipting á kúlu niður í þríhyrninga með lengdar- og breiddarbaugum]
)

= Nvidia GeForce RTX 4090
+ Innri bandvídd eru 1008 GB/s
+ Ytri bandvídd eru ca 31.5 GB/s
+ Litahraði skápunkta liggur á milli 392.5 og 443.5 Gpx/s
+ Hámarksupplausn er $7680 times 4320$ sem fellur undir 8K ultra-HD

= Útreikningar án lesturs
Við höfum $3840 times 2160 = 8294400$ pixla og við uppfærum þessa pixla $144$ sinnum á sekúndu, við höfum þá í heildina $3*8294400*144 = 3583180800$ bæti á sekúndu eða ca $3583$MB/s ($3.58$GB/s)

= OpenGL SC
Þessi útgáfa af OpenGL er, samkvæmt #link("https://www.khronos.org/openglsc/")[khronos samtökunum], hannað fyrir _safety critical systems (SCS)_ sem krefjast meira öryggis en önnur kerfi. Skilgreining á þessum kerfum segir að ef þau klikka þá geti það valdið skaða á fólki eða jafnvel dauða. Þetta er ólíkt til dæmis WebGL sem er hannað fyrir notkun á internetinu þar sem öryggi er yfirleitt ekki í fyrsta sæti.

#pagebreak()
= Sierpinski þríhyrningur

#grid(
  columns: (1fr, 1fr), 
  gutter: 16pt, 
  figure(
    image("../imgs/v1_sierpinski_unmodded.png"), 
    caption: [fyrir breytingu á kóða]
  ), 
  figure(
    image("../imgs/v1_sierpinski.png"), 
    caption: [eftir breytingu á kóða]
  )
)

