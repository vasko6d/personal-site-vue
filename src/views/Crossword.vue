<template>
  <div id="crossword">
    <div class="blk-container">
      <div>
        <h2>{{ xword.title }}</h2>
        by {{ xword.author }}, {{ xword.createDate }}
      </div>
      <xword-clues :clues="xword.clues.across" title="Across" />
      <xword-clues :clues="xword.clues.down" title="Down" />
    </div>
  </div>
</template>

<script>
import XwordClues from "@/components/crossword/XwordClues.vue";
export default {
  name: "crossword",
  components: {
    XwordClues
  },
  data() {
    return {
      showAcross: false,
      showDown: false,
      xword: {
        title: "We are at a Railroad Crossing",
        author: "David Vasko",
        createDate: "20140101", // do not remember >.<!
        escapeCharacter: "|", // if more than one character is in a square we need an escape character
        blackSpace: "#", // black space that does not get input
        nullSpace: "_", // a null space is a space that is neither black not white and should not have input
        specialSquares: [], // Coordinate list of squares that need special rendering
        solution: [
          ["RGB###RAN###FAR"], // 0
          ["IRON#PUMAS#TORO"], // 1
          ["BIRO#APUNT#ARMS"], // 2
          ["STARTLE#DOORDYE"], // 3
          ["####REE#SUR####"], // 4
          ["#TASER###RETRAL"], // 5
          ["MOPED#REREMOUSE"], // 6
          ["ITUP#BARNS#KNOT"], // 7
          ["DELIVERER#REELS"], // 8
          ["IMPAIR###RONDO#"], // 9
          ["####REP#EUR####"], // 10
          ["EMERITI#VERRUCA"], // 11
          ["MOREL#TWO#INRUN"], // 12
          ["IRISE#OIL#MADRE"], // 13
          ["RTE###TGV###USR"] // 14
          //012345678911111
          //          01234
        ],
        clues: {
          across: {
            1: { txt: "Color code, briefly" },
            7: { txt: "Long way off" },
            4: { txt: "Hurried" },
            9: { txt: "By _" },
            10: { txt: "Word with Man or nine" },
            12: { txt: "Certain shoes or cats" },
            14: { txt: "Bull" },
            15: { txt: "A brand of, and generic term for a ballpoint pen" },
            16: { txt: "Result of a three and out" },
            17: { txt: "Gives weapons to" },
            18: { txt: "Say 'boo' to" },
            20: { txt: "A risky but necessary move in paintball?" },
            22: {
              txt:
                "Prepend 't' to make a plant, append 'd' to make a mouthpiece"
            },
            23: { txt: "Big _, California" },
            24: { txt: "It causes neuromuscular incapacitation" },
            27: { txt: "Toward the back" },
            32: { txt: "Vespa e.g" },
            33: { txt: "Bat" },
            36: { txt: "'Juice _!'" },
            37: { txt: "Steryotypical red farm buildings" },
            38: { txt: "Square or figure eight, e.g" },
            39: { txt: "Pizza man or Mail man, e.g." },
            41: { txt: "Pulls in a fish" },
            42: { txt: "Weaken" },
            43: { txt: "Musical form with repeating theme" },
            44: { txt: "Part of a set" },
            46: { txt: "Currency of Spn. and Fra." },
            47: {
              txt:
                "One who is retired but retains an honorary title corresponding to that held immediately before retirement"
            },
            51: { txt: "Often called a plantar wart" },
            56: {
              txt: "A honeycomb-like mushroom"
            },
            57: { txt: "sin(x)^2 + cos(x)^2 + 1" },
            59: {
              txt: "The approach ramp of a ski jump"
            },
            60: { txt: "'And Still ___', by Maya Angelou" },
            61: {
              txt: "Lubricant, illuminator and combustor"
            },
            62: { txt: "Mother, to Juan" },
            63: { txt: "Highway, briefly" },
            64: { txt: "Fre. high speed rail" },
            65: {
              txt:
                "A unix directory that usually contains the lartest share of data"
            }
          },
          down: {
            1: { txt: "Curved bones, or teases good-naturedly" },
            2: { txt: "2010 film, 'True _'" },
            3: { txt: "When repeated, an island group in French Polynesia" },
            4: { txt: "Currency in Sri Lanka" },
            5: { txt: "A meausrement used to express molecular wts." },
            6: { txt: "Logic gates that return false if all inputs are ture" },
            7: { txt: "_ Fiesta" },
            8: { txt: "Swarm" },
            9: { txt: "A girls name or flower" },
            11: {
              txt:
                "This word is used to present the second of two untrue alternatives"
            },
            12: { txt: "Having less color" },
            13: {
              txt:
                "Wind blown dusts, or if you remove the middle letter, places to buy things"
            },
            14: { txt: "Ending of plan or supers" },
            19: { txt: "'Don't _ on me'" },
            21: { txt: "A city in Utah" },
            24: { txt: "A tall monumental sculpture carved on a large tree" },
            25: { txt: "'Beat him to _'" },
            26: { txt: "Reddish brown pigment" },
            28: { txt: "Voucher" },
            29: { txt: "Having old languages inscribed" },
            30: {
              txt:
                "You may score this one part in an opera if you are very good"
            },
            31: { txt: "Allows" },
            32: { txt: "_ skirt" },
            33: { txt: "7Zip and Win_ are copresson and unpacking software" },
            34: { txt: "Before" },
            35: { txt: "What you deserve after some good hard work, briefly" },
            37: { txt: "A type of flat cap" },
            40: { txt: "Having strength, energy, and a strong sex drive" },
            41: {
              txt:
                "By performing this action on this answer, it will be right side up"
            },
            43: { txt: "Regret" },
            45: { txt: "This type of tube is used to measure pressure" },
            46: { txt: "Rock climbing shoe brand" },
            47: { txt: "Turkish title" },
            48: { txt: "_ Goldman, a character in Family Guy" },
            49: { txt: "Fourth largest of th great lakes" },
            50: { txt: "Hi _" },
            52: { txt: "It is made of U, G, C and A" },
            53: { txt: "An Arabic language" },
            54: { txt: "Mongrel dogs" },
            55: { txt: "A male insect" },
            58: { txt: "May be worn to disguise baldness" }
          }
        }
      }
    };
  },
  mounted() {
    this.preProccessXword(this.xword);
  },
  methods: {
    preProccessXword(xword) {
      console.log(xword);
    }
  }
};
</script>

<style lang="scss" scoped></style>
