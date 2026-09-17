/* Standard shapes adapted from Ray geometry-benchmark-matrix; see benchmark-presets.md. */
(function(root){
"use strict";
const presets=[
  {
    "id": "cube",
    "name": "Cube",
    "group": "Polyhedra",
    "keywords": "立方体 正六面体",
    "type": "Six square faces, written as half-space constraints",
    "expression": "max(abs(x),max(abs(y),abs(z))) = 1",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c6"
      ]
    },
    "span": 1.5
  },
  {
    "id": "tetrahedron",
    "name": "Regular tetrahedron",
    "group": "Polyhedra",
    "keywords": "正四面体",
    "type": "Four equilateral faces around alternating cube vertices",
    "expression": "max(x+y+z,max(x-y-z,max(-x+y-z,-x-y+z))) = 1",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c6"
      ]
    },
    "span": 1.45
  },
  {
    "id": "dodecahedron",
    "name": "Regular dodecahedron",
    "group": "Polyhedra",
    "keywords": "正十二面体 柏拉图",
    "type": "Twelve regular pentagonal faces",
    "expression": "max(abs(x)+(1+sqrt(5))*abs(y)/2,max(abs(y)+(1+sqrt(5))*abs(z)/2,abs(z)+(1+sqrt(5))*abs(x)/2)) = (3+sqrt(5))/2",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c4"
      ]
    },
    "span": 2.05
  },
  {
    "id": "icosahedron",
    "name": "Regular icosahedron",
    "group": "Polyhedra",
    "keywords": "正二十面体 柏拉图",
    "type": "Twenty equilateral triangular faces",
    "expression": "max(abs(x)+abs(y)+abs(z),max((1+sqrt(5))*abs(x)/2+2abs(z)/(1+sqrt(5)),max((1+sqrt(5))*abs(y)/2+2abs(x)/(1+sqrt(5)),(1+sqrt(5))*abs(z)/2+2abs(y)/(1+sqrt(5))))) = 2",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c5"
      ]
    },
    "span": 1.65
  },
  {
    "id": "triangular-prism",
    "name": "Triangular prism",
    "group": "Polyhedra",
    "keywords": "三棱柱 棱镜",
    "type": "An equilateral triangular section with two end caps",
    "expression": "max(abs(z)-1.2,max(-y-0.6,max(sqrt(3)*x+y-1.2,-sqrt(3)*x+y-1.2))) = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c1"
      ]
    },
    "span": 1.6
  },
  {
    "id": "capped-cone",
    "name": "Finite cone",
    "group": "Quadrics",
    "keywords": "有限圆锥 封闭圆锥",
    "type": "A single cone with a circular base",
    "expression": "max(sqrt(x^2+y^2)+z/2-1,max(-z,z-2)) = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r6-c2"
      ]
    },
    "domain": [
      [
        -1.4,
        1.4
      ],
      [
        -1.4,
        1.4
      ],
      [
        -0.2,
        2.2
      ]
    ]
  },
  {
    "id": "capped-cylinder",
    "name": "Finite cylinder",
    "group": "Quadrics",
    "keywords": "有限圆柱 封闭圆柱",
    "type": "A circular cylinder with two flat caps",
    "expression": "max(x^2+y^2-1,abs(z)-1.25) = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r6-c2"
      ]
    },
    "span": 1.6
  },
  {
    "id": "catenoid",
    "name": "Catenoid",
    "group": "Classical",
    "keywords": "悬链面 旋转悬链线 极小曲面",
    "type": "The surface obtained by revolving a catenary",
    "expression": "x^2 + y^2 = 0.55^2*cosh(z/0.55)^2",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r6-c7"
      ]
    },
    "domain": [
      [
        -1.6,
        1.6
      ],
      [
        -1.6,
        1.6
      ],
      [
        -0.9,
        0.9
      ]
    ]
  },
  {
    "id": "astroidal",
    "name": "Astroidal surface",
    "group": "Sculpted",
    "keywords": "星形曲面 星状球 L2/3",
    "type": "A concave L^(2/3) unit ball with six cusps",
    "expression": "abs(x)^(2/3) + abs(y)^(2/3) + abs(z)^(2/3) = 1",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c3"
      ]
    },
    "span": 1.2
  },
  {
    "id": "barth-sextic",
    "name": "Barth sextic",
    "group": "Classical",
    "keywords": "巴特 六次 代数曲面",
    "type": "A golden-ratio sextic with an intricate nodal structure",
    "expression": "-27.41640786499874*x^4*y^2+10.47213595499958*x^4*z^2-4.23606797749979*x^4+10.47213595499958*x^2*y^4+67.77708763999664*x^2*y^2*z^2-8.47213595499958*x^2*y^2-27.41640786499874*x^2*z^4-8.47213595499958*x^2*z^2+8.47213595499958*x^2-27.41640786499874*y^4*z^2-4.23606797749979*y^4+10.47213595499958*y^2*z^4-8.47213595499958*y^2*z^2+8.47213595499958*y^2-4.23606797749979*z^4+8.47213595499958*z^2-4.23606797749979 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r1-c1"
      ],
      "object": "geo-barth-sextic-surface"
    },
    "span": 1.5
  },
  {
    "id": "togliatti",
    "name": "Togliatti quintic",
    "group": "Classical",
    "keywords": "托利亚蒂 五次 代数曲面",
    "type": "A fivefold nodal surface from the benchmark polynomial",
    "expression": "-0.20288543819998311-0.9878023861866252*z-0.8521980673998822*z^2+1.025195902793228*z^3+0.22111456180001682*z^4-0.2660012401775702*z^5+2.1321980673998824*y^2-1.025195902793228*y^2*z-0.44222912360003364*y^2*z^2+0.5320024803551404*y^2*z^3-0.09888543819998319*y^4-0.2660012401775702*y^4*z+0.32*x*y^4+2.1321980673998824*x^2-1.025195902793228*x^2*z-0.44222912360003364*x^2*z^2+0.5320024803551404*x^2*z^3-0.19777087639996638*x^2*y^2-0.5320024803551404*x^2*y^2*z-0.64*x^3*y^2-0.09888543819998319*x^4-0.2660012401775702*x^4*z+0.064*x^5 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r1-c2"
      ],
      "object": "geo-togliatti-quintic-surface"
    },
    "span": 2.7
  },
  {
    "id": "clebsch",
    "name": "Clebsch cubic",
    "group": "Classical",
    "keywords": "克莱布什 三次 代数曲面",
    "type": "The classical diagonal cubic surface",
    "expression": "81*x^3+81*y^3+81*z^3-189*x^2*y-189*x^2*z-189*x*y^2-189*y^2*z-189*x*z^2-189*y*z^2+54*x*y*z-9*x^2-9*y^2-9*z^2+126*x*y+126*x*z+126*y*z-9*x-9*y-9*z+1 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r1-c3"
      ],
      "object": "geo-clebsch-diagonal-cubic-surface"
    },
    "span": 1.2
  },
  {
    "id": "chmutov",
    "name": "Chmutov octic",
    "group": "Classical",
    "keywords": "奇穆托夫 切比雪夫 八次",
    "type": "The degree-eight Chebyshev sum T8(x)+T8(y)+T8(z)=0",
    "expression": "3-32*x^2+160*x^4-256*x^6+128*x^8-32*y^2+160*y^4-256*y^6+128*y^8-32*z^2+160*z^4-256*z^6+128*z^8 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r1-c5"
      ],
      "object": "geo-chmutov-order-8"
    },
    "span": 1.05
  },
  {
    "id": "kummer-quartic",
    "name": "Kummer-type quartic",
    "group": "Classical",
    "keywords": "库默 四次 对称曲面",
    "type": "The cubic-symmetric quartic used in the benchmark",
    "expression": "0.08-0.28*x^2+1*x^4-1.15*x^2*y^2-1.15*x^2*z^2-0.28*y^2+1*y^4-1.15*y^2*z^2-0.28*z^2+1*z^4 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r1-c7"
      ],
      "object": "geo-kummer-surface"
    },
    "span": 1.4
  },
  {
    "id": "ding-dong",
    "name": "Ding-Dong surface",
    "group": "Classical",
    "keywords": "叮咚 钟形 三次",
    "type": "A rotational cubic with a pinched bell",
    "expression": "1*x^2+1*y^2+1*z^3-1*z^2 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r2-c1"
      ],
      "object": "geo-ding-dong-surface-bell-shaped-self-intersecting-cubic"
    },
    "domain": [
      [
        -1,
        1
      ],
      [
        -1,
        1
      ],
      [
        -0.75,
        1.15
      ]
    ]
  },
  {
    "id": "roman",
    "name": "Roman surface",
    "group": "Classical",
    "keywords": "罗马 施泰纳 自交 曲面",
    "type": "The Steiner surface with intersecting singular lines",
    "expression": "1*x^2*y^2+1*y^2*z^2+1*x^2*z^2-1*x*y*z = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r2-c4"
      ],
      "object": "geo-roman-surface"
    },
    "span": 0.6
  },
  {
    "id": "tanglecube",
    "name": "Tanglecube",
    "group": "Classical",
    "keywords": "缠绕立方体 四次",
    "type": "A quartic cube-like shell with handles",
    "expression": "11.8-5*x^2+1*x^4-5*y^2+1*y^4-5*z^2+1*z^4 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r2-c5"
      ],
      "object": "geo-tanglecube"
    },
    "span": 2.8
  },
  {
    "id": "dupin",
    "name": "Dupin cyclide",
    "group": "Classical",
    "keywords": "杜邦 双曲线环面 圆纹曲面",
    "type": "The benchmark cyclide in its local polynomial coordinates",
    "expression": "-0.0241476435720371-0.526006963093939*x+0.7744*z^2-0.968*y^2-0.968000000000004*x^2+1.80048*x*z^2+1.80048*x*y^2+1.80048*x^3+3.59631009*z^4+7.19262018*y^2*z^2+3.59631009*y^4+7.19262018*x^2*z^2+7.19262018*x^2*y^2+3.59631009*x^4 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r2-c6"
      ],
      "object": "geo-dupin-cyclide-equation"
    },
    "span": 1.1
  },
  {
    "id": "whitney",
    "name": "Whitney umbrella",
    "group": "Classical",
    "keywords": "惠特尼 伞面 奇点",
    "type": "A pinched cubic surface with a singular handle",
    "expression": "1*x^2-1*y^2*z-0.09*y^2 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r4-c1"
      ],
      "object": "geo-cubic-cusp-whitney-umbrella-like-surface"
    },
    "domain": [
      [
        -1.5,
        1.5
      ],
      [
        -1.5,
        1.5
      ],
      [
        -0.7,
        1.8
      ]
    ]
  },
  {
    "id": "quartic-revolution",
    "name": "Parabolic revolution",
    "group": "Classical",
    "keywords": "抛物线 旋转曲面 四次锥面",
    "type": "The quartic surface x^2+y^2=z^4",
    "expression": "-1*x^2-1*y^2+1*z^4 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r4-c4"
      ],
      "object": "geo-surface-of-revolution-by-parabola"
    },
    "span": 1.5
  },
  {
    "id": "dervish",
    "name": "Dervish quintic",
    "group": "Classical",
    "keywords": "德尔维什 托利亚蒂 五次",
    "type": "The benchmark fivefold Dervish/Togliatti polynomial",
    "expression": "3.3055433871775866*z^5-6.15700466398828*y^2*z^3+0.3717480344601847*y^4*z-1.2030019100150915*x*y^4-6.15700466398828*x^2*z^3+0.7434960689203702*x^2*y^2*z+2.4060038200301825*x^3*y^2+0.371748034460184*x^4*z-0.24060038200301812*x^5+0.6545084971874737*z^4+1.618033988749895*y^2*z^2+1*y^4+1.618033988749895*x^2*z^2+2*x^2*y^2+1*x^4+1.3449970239279145*z^3+1.6625077511098136*y^2*z+1.6625077511098136*x^2*z-1.618033988749895*z^2-2*y^2-2*x^2-0.8312538755549068*z+1 = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r4-c6"
      ],
      "object": "geo-togliatti-dervish-quintic-nodal-surface"
    },
    "span": 2.7
  },
  {
    "id": "harmonic-30",
    "name": "Spherical harmonic Y₃⁰",
    "group": "Classical",
    "keywords": "球谐函数 轨道 f 轴对称",
    "type": "The radial surface r = |Y₃⁰|, expressed implicitly",
    "expression": "(x^2+y^2+z^2)^4 = 7/(16*pi)*(5z^3-3z*(x^2+y^2+z^2))^2",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r5-c2"
      ]
    },
    "span": 0.85
  },
  {
    "id": "harmonic-32",
    "name": "Spherical harmonic Y₃²",
    "group": "Classical",
    "keywords": "球谐函数 轨道 f 八叶",
    "type": "The real sine-basis surface r = |Y₃²|",
    "expression": "(x^2+y^2+z^2)^4 = 105/(4*pi)*x^2*y^2*z^2",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r5-c2"
      ]
    },
    "span": 0.65
  },
  {
    "id": "stellated-dodecahedron",
    "name": "Stellated dodecahedron",
    "group": "Polyhedra",
    "keywords": "小星形 十二面体 星状 多面体",
    "type": "Twelve pentagonal pyramids from the benchmark mesh",
    "expression": "min(min(min(max(max(max(-0.8506503118*x-0.5257319156*y-1.3763822274,max(-0.5257319156*x-0.8506503118*z-1.3763822274,-0.8506503118*y-0.5257319156*z-1.3763822274)),max(-0.5257290085*x+0.8506521084*z-1.376381117,max(-0.8506521084*y+0.5257290085*z-1.376381117,-0.8506521084*x+0.5257290085*y-1.376381117))),max(max(0.8506521084*y-0.5257290085*z-1.376381117,max(0.8506503118*y+0.5257319156*z-1.3763822274,0.8506521084*x-0.5257290085*y-1.376381117)),max(0.5257290085*x-0.8506521084*z-1.376381117,max(0.5257319156*x+0.8506503118*z-1.3763822274,0.8506503118*x+0.5257319156*y-1.3763822274)))),min(max(max(-0.8842960966*x+0.4669265611*y-1.4308222948,max(-0.5711222999*x-0.0398010664*y-0.8198995021*z-1.4308228685,-0.0643995767*x-0.8596986276*y-0.5067257288*z-1.4308239331)),max(-0.0643995767*x-0.8596986276*y+0.5067257288*z-1.4308239331,max(-0.5711222999*x-0.0398010664*y+0.8198995021*z-1.4308228685,0.8506503118*x+0.5257319156*y+1.3763822274))),max(max(0.4669265611*x-0.8842960966*z-1.4308222948,max(-0.0398010664*x-0.8198995021*y-0.5711222999*z-1.4308228685,-0.8596986276*x-0.5067257288*y-0.0643995767*z-1.4308239331)),max(-0.8596986276*x+0.5067257288*y-0.0643995767*z-1.4308239331,max(-0.0398010664*x+0.8198995021*y-0.5711222999*z-1.4308228685,0.5257319156*x+0.8506503118*z+1.3763822274))))),min(max(max(-0.8842960966*y+0.4669265611*z-1.4308222948,max(-0.8198995021*x-0.5711222999*y-0.0398010664*z-1.4308228685,-0.5067257288*x-0.0643995767*y-0.8596986276*z-1.4308239331)),max(0.5067257288*x-0.0643995767*y-0.8596986276*z-1.4308239331,max(0.8198995021*x-0.5711222999*y-0.0398010664*z-1.4308228685,0.8506503118*y+0.5257319156*z+1.3763822274))),min(max(max(-0.8596986276*x+0.5067257288*y+0.0643995767*z-1.4308239331,max(-0.8596986276*x-0.5067257288*y+0.0643995767*z-1.4308239331,-0.0398010664*x-0.8198995021*y+0.5711222999*z-1.4308228685)),max(0.4669265611*x+0.8842960966*z-1.4308222948,max(-0.0398010664*x+0.8198995021*y+0.5711222999*z-1.4308228685,0.5257290085*x-0.8506521084*z+1.376381117))),max(max(0.5067257288*x-0.0643995767*y+0.8596986276*z-1.4308239331,max(-0.5067257288*x-0.0643995767*y+0.8596986276*z-1.4308239331,-0.8198995021*x-0.5711222999*y+0.0398010664*z-1.4308228685)),max(-0.8842960966*y-0.4669265611*z-1.4308222948,max(0.8198995021*x-0.5711222999*y+0.0398010664*z-1.4308228685,0.8506521084*y-0.5257290085*z+1.376381117)))))),min(min(max(max(-0.0643995767*x+0.8596986276*y+0.5067257288*z-1.4308239331,max(-0.0643995767*x+0.8596986276*y-0.5067257288*z-1.4308239331,-0.5711222999*x+0.0398010664*y-0.8198995021*z-1.4308228685)),max(-0.8842960966*x-0.4669265611*y-1.4308222948,max(-0.5711222999*x+0.0398010664*y+0.8198995021*z-1.4308228685,0.8506521084*x-0.5257290085*y+1.376381117))),min(max(max(0.5067257288*x+0.0643995767*y-0.8596986276*z-1.4308239331,max(-0.5067257288*x+0.0643995767*y-0.8596986276*z-1.4308239331,-0.8198995021*x+0.5711222999*y-0.0398010664*z-1.4308228685)),max(0.8842960966*y+0.4669265611*z-1.4308222948,max(0.8198995021*x+0.5711222999*y-0.0398010664*z-1.4308228685,-0.8506521084*y+0.5257290085*z+1.376381117))),max(max(0.8842960966*y-0.4669265611*z-1.4308222948,max(-0.8198995021*x+0.5711222999*y+0.0398010664*z-1.4308228685,-0.5067257288*x+0.0643995767*y+0.8596986276*z-1.4308239331)),max(0.5067257288*x+0.0643995767*y+0.8596986276*z-1.4308239331,max(0.8198995021*x+0.5711222999*y+0.0398010664*z-1.4308228685,-0.8506503118*y-0.5257319156*z+1.3763822274))))),min(min(max(max(0.0643995767*x-0.8596986276*y+0.5067257288*z-1.4308239331,max(0.0643995767*x-0.8596986276*y-0.5067257288*z-1.4308239331,0.5711222999*x-0.0398010664*y-0.8198995021*z-1.4308228685)),max(0.8842960966*x+0.4669265611*y-1.4308222948,max(0.5711222999*x-0.0398010664*y+0.8198995021*z-1.4308228685,-0.8506521084*x+0.5257290085*y+1.376381117))),max(max(0.8596986276*x+0.5067257288*y-0.0643995767*z-1.4308239331,max(0.8596986276*x-0.5067257288*y-0.0643995767*z-1.4308239331,0.0398010664*x-0.8198995021*y-0.5711222999*z-1.4308228685)),max(-0.4669265611*x-0.8842960966*z-1.4308222948,max(0.0398010664*x+0.8198995021*y-0.5711222999*z-1.4308228685,-0.5257290085*x+0.8506521084*z+1.376381117)))),min(max(max(-0.4669265611*x+0.8842960966*z-1.4308222948,max(0.0398010664*x-0.8198995021*y+0.5711222999*z-1.4308228685,0.8596986276*x-0.5067257288*y+0.0643995767*z-1.4308239331)),max(0.8596986276*x+0.5067257288*y+0.0643995767*z-1.4308239331,max(0.0398010664*x+0.8198995021*y+0.5711222999*z-1.4308228685,-0.5257319156*x-0.8506503118*z+1.3763822274))),max(max(0.8842960966*x-0.4669265611*y-1.4308222948,max(0.5711222999*x+0.0398010664*y-0.8198995021*z-1.4308228685,0.0643995767*x+0.8596986276*y-0.5067257288*z-1.4308239331)),max(0.0643995767*x+0.8596986276*y+0.5067257288*z-1.4308239331,max(0.5711222999*x+0.0398010664*y+0.8198995021*z-1.4308228685,-0.8506503118*x-0.5257319156*y+1.3763822274))))))) = 0",
    "source": {
      "collection": "Ray geometry benchmark",
      "cells": [
        "r3-c7"
      ],
      "object": "geo-r3-c7-small-stellated-dodecahedron-group"
    },
    "span": 2.85
  }
];
root.SurfaceBenchmarkPresets=presets;
if(typeof module!=="undefined" && module.exports)module.exports=presets;
})(typeof globalThis!=="undefined"?globalThis:this);
