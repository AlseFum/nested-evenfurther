export default {
  "universe": {
    "title": "宇宙",
    "line": "一个浩瀚的宇宙，包含无数星系",
    "slot": {
      "branch": [
        {
          "weight": 6,
          "content": [
            "spiralGalaxy",
            "spiralGalaxy",
            "ellipticalGalaxy"
          ]
        },
        {
          "weight": 1,
          "content": [
            "irregularGalaxy",
            "blackHole"
          ]
        }
      ]
    }
  },
  "spiralGalaxy": {
    "title": "螺旋星系",
    "line": "美丽的旋臂结构星系",
    "slot": {
      "seq": [
        {
          "repeat": [100, 500],
          "value": "starSystem"
        },
        "nebula",
        {
          "repeat": [1, 5],
          "value": "blackHole"
        }
      ]
    }
  },
  "ellipticalGalaxy": {
    "title": "椭圆星系",
    "line": "古老的椭圆形状星系",
    "slot": {
      "seq": [
        {
          "repeat": [1000, 10000],
          "value": "oldStar"
        }
      ]
    }
  },
  "irregularGalaxy": {
    "title": "不规则星系",
    "line": "形状不规则的特殊星系",
    "slot": {
      "branch": [
        {
          "weight": 2,
          "content": ["youngStar", "nebula"]
        },
        {
          "weight": 1,
          "content": ["starSystem", "blackHole"]
        }
      ]
    }
  },
  "starSystem": {
    "title": "恒星系统",
    "line": "围绕恒星运行的天体系统",
    "slot": {
      "branch": [
        {
          "weight": 5,
          "content": [
            "star",
            {
              "repeat": [1, 8],
              "value": "planet"
            },
            {
              "repeat": [0, 3],
              "value": "gasGiant"
            }
          ]
        },
        {
          "weight": 1,
          "content": [
            "binaryStar",
            {
              "repeat": [2, 6],
              "value": "planet"
            }
          ]
        }
      ]
    }
  },
  "star": {
    "title": "恒星",
    "line": "发光发热的恒星",
    "slot": {
      "branch": [
        {
          "weight": 3,
          "content": ["mainSequenceStar"]
        },
        {
          "weight": 1,
          "content": ["redGiant"]
        },
        {
          "weight": 0.5,
          "content": ["whiteDwarf"]
        }
      ]
    }
  },
  "planet": {
    "title": "行星",
    "line": "围绕恒星运行的行星",
    "slot": {
      "branch": [
        {
          "weight": 2,
          "content": ["rockyPlanet"]
        }
      ]
    }
  },
  "rockyPlanet": {
    "title": "岩石行星",
    "line": "拥有固态表面的行星",
    "slot": {
      "seq": [
        "continents",
        "oceans",
        {
          "repeat": [0, 2],
          "value": "moon"
        }
      ]
    }
  },
  "continents": {
    "title": "大陆",
    "line": "广阔的大陆板块",
    "slot": {
      "seq": [
        {
          "repeat": [1, 7],
          "value": "continent"
        }
      ]
    }
  },
  "continent": {
    "title": "大陆",
    "line": "一片独立的大陆",
    "slot": {
      "branch": [
        {
          "weight": 3,
          "content": [
            {
              "repeat": [2, 10],
              "value": "mountainRange"
            },
            {
              "repeat": [1, 5],
              "value": "river"
            },
            "forest"
          ]
        },
        {
          "weight": 1,
          "content": ["desert", "plains"]
        }
      ]
    }
  },
  "mountainRange": {
    "title": "山脉",
    "line": "连绵起伏的山脉",
    "slot": {
      "seq": [
        {
          "repeat": [5, 20],
          "value": "mountain"
        }
      ]
    }
  },
  "mountain": {
    "title": "山峰",
    "line": "高耸的山峰",
    "slot": {
      "branch": [
        {
          "weight": 8,
          "content": ["rock", "snow"]
        },
        {
          "weight": 2,
          "content": ["cave", "minerals"]
        }
      ]
    }
  },
  "forest": {
    "title": "森林",
    "line": "茂密的森林",
    "slot": {
      "seq": [
        {
          "repeat": [100, 1000],
          "value": "tree"
        },
        {
          "repeat": [10, 100],
          "value": "animal"
        }
      ]
    }
  },
  "tree": {
    "title": "树木",
    "line": "高大的树木",
    "slot": {
      "branch": [
        {
          "weight": 3,
          "content": ["leaves", "trunk", "roots"]
        },
        {
          "weight": 1,
          "content": ["birdNest", "leaves", "trunk"]
        }
      ]
    }
  },
  "animal": {
    "title": "动物",
    "line": "森林中的动物",
    "slot": {
      "branch": [
        {
          "weight": 3,
          "content": ["mammal"]
        },
        {
          "weight": 2,
          "content": ["bird"]
        },
        {
          "weight": 1,
          "content": ["reptile"]
        }
      ]
    }
  },
  "blackHole": {
    "title": "黑洞",
    "line": "引力极强的天体",
    "slot": ["singularity", "eventHorizon"]
  },
  "nebula": {
    "title": "星云",
    "line": "宇宙中的气体和尘埃云",
    "slot": ["gas", "dust", "newStars"]
  },
  "singularity": {
    "title": "奇点",
    "line": "黑洞的中心点",
    "slot": []
  },
  "rock": {
    "title": "岩石",
    "line": "坚固的岩石",
    "slot": ["minerals"]
  },
  "snow": {
    "title": "积雪",
    "line": "山顶的积雪",
    "slot": ["iceCrystals"]
  },
  "leaves": {
    "title": "树叶",
    "line": "树木的叶子",
    "slot": ["chlorophyll"]
  },
  "trunk": {
    "title": "树干",
    "line": "树木的主干",
    "slot": ["wood", "bark"]
  },
  "mammal": {
    "title": "哺乳动物",
    "line": "温血脊椎动物",
    "slot": ["fur", "organs", "skeleton"]
  },
  "gas": {
    "title": "气体",
    "line": "星际气体",
    "slot": ["hydrogen", "helium"]
  },
  "minerals": {
    "title": "矿物",
    "line": "地壳中的矿物质",
    "slot": ["crystals", "ore"]
  }
}