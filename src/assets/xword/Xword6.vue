<script>
export default {
  name: "Xword3",
  data() {
    return {
      xword: {
        id: 6,
        title: "Wolfgang",
        author: "David Vasko",
        editor: "David Vasko",
        createDate: "20191016",
        difficulty: 6,
        dimension: "21x21",
        theme:
          "Each **stared clue is only made up of the letters [A, B, C, D, E, F, G] which represent the notes of the C-Major scale",
        colorCells: [],
        shapeCells: [],
        numbering: [],
        solution: [
          "ROWOF#INI#IOS####GASP",
          "ARENA#FACEDDECAF#OHNO",
          "EBBED#DAYSOFYORE#LAUD",
          "##PDF#ONDA#BEGGEDABBA",
          "SEAEAR##EVO####ARM###",
          "EGGEDAFACADE#CAGEBEEF",
          "WOE#EVIL#CABBAGEADAGE",
          "###ADENT#ASSISI##ASAD",
          "LAOS#NDA####DAVIS#TDS",
          "ALIFE####BASEMENTS###",
          "MELODYWRITTENINCMAJOR",
          "###GIVEACENT####TIARA",
          "SNI#TREVI####ICK#NYET",
          "CAMP##CANFLY#SHIFT###",
          "ADDEDBAGGAGE#LANE#GAY",
          "BABECAFE#BEADEDDECADE",
          "###LAD####SRE##ADAMAS",
          "BEDDEDGAGA#OSSO#AME##",
          "IDEO#OOLONGLEAF#BEBOP",
          "TGEL#GABBEDDEAF#ERASE",
          "SERE####ISP#DBA#EAGER"
        ],
        clues: {
          across: {
            1: { txt: '"...like a _ dominoes"' },
            6: { txt: 'File extension akin to ".conf"' },
            9: { txt: "Apple core?" },
            12: {
              txt: "Action frequently done before saying 22-Across or 43-Down"
            },
            16: { txt: "Field" },
            17: { txt: "**Didn't have full strength coffee?" },
            22: { txt: "Saying frequently said after 12-Across" },
            23: { txt: "**Like receded water" },
            24: { txt: "The nostalgic past" },
            25: { txt: "Opposite of 14-Down" },
            26: { txt: "Resume or tax form, often" },
            27: { txt: '"Thug _ Line" by rapper Krayzie Bone' },
            28: { txt: "**Pled for more Dancing Queen?" },
            30: { txt: "Abalone" },
            33: { txt: "Prefix with cation or king" },
            35: { txt: "Limb" },
            36: { txt: "**Threw future chickens at Notre Dame?" },
            40: { txt: "**Put a cow in the zoo?" },
            45: { txt: "Pain" },
            46: { txt: "Like the serpent" },
            47: { txt: "**Proverb about a densly leaved vegetable?" },
            49: {
              txt:
                "Bad thing to have on your car, yet good thing to make in piles of work."
            },
            50: { txt: "Saint Francis locale" },
            51: { txt: '"You are _, strange little man"' },
            52: { txt: "Neighbor of Thailand and Vietnam" },
            55: { txt: "Confidentiality agrmt." },
            56: { txt: "Home of the Aggies" },
            59: { txt: "Some NFL passes" },
            60: { txt: '"Get _!"' },
            62: { txt: "Cellars" },
            66: {
              txt:
                "First song of a young pianist, OR how each **stared clue could be interpreted"
            },
            74: { txt: 'Opposite of "take the penny"' },
            75: { txt: "Diadem" },
            76: {
              txt:
                "Extension to the TLS computer networking protocol by which a client specifies which host it is attempting to connect to"
            },
            79: { txt: '"Three Coins in the Fountain" fountain' },
            80: { txt: '"Eww!"' },
            83: { txt: "A Russian no" },
            84: { txt: '"_ Know Where ’85" from Stranger Things' },
            86: { txt: '"You _" classic Peter Pan lyric' },
            90: { txt: "Advance to second, perhaps" },
            92: { txt: "**Used an additional suitcase" },
            95: { txt: "One of 26 on the Katy Freeway" },
            96: { txt: "Merry" },
            99: {
              txt: "**A Starbucks for only attractive women and newborns?"
            },
            100: { txt: "**One fifth a Holy Rosary" },
            103: { txt: "Chap" },
            104: {
              txt:
                'According to Ben Treynor, this job is "what happens when a software engineer is tasked with what used to be called operations.": abbr.'
            },
            105: { txt: "Bill and Lee on Battlestar Galactica" },
            106: {
              txt:
                "**Brought Stefani Joanne Angelina Germanotta back to your room?"
            },
            113: { txt: "_ buco" },
            116: { txt: '"It\'s _, Mario!"' },
            117: { txt: '"Thought" prefix' },
            118: { txt: "Future tea" },
            120: { txt: 'Iconic Anime series "Cowboy _"' },
            123: { txt: "Selsun Blue competitor" },
            124: { txt: "**Lost your hearing after listening too long" },
            125: { txt: "Remove" },
            126: { txt: "Like 111-Down" },
            127: { txt: "Company such as AT&T" },
            128: { txt: "Manager of Oracle or MySQL" },
            129: { txt: "Hungry, as for the Sunday Crossword" }
          },
          down: {
            1: { txt: "Carly _ Jepsen with the hit 'Call Me Maybe'" },
            2: { txt: "Mars or Venus, essentially" },
            3: { txt: "What this crossword debuted on" },
            4: { txt: "Can be said of a daisy but not a dandelion?" },
            5: { txt: "**The latest craze fell into obscurity" },
            6: {
              txt: "_ contidion met, _ conditional action (programming logic)"
            },
            7: { txt: "Vehicle for transporing masala?" },
            8: { txt: "A particularly cold winter month: abbr." },
            9: { txt: "Common vow" },
            10: {
              txt: "Microsoft cloud service for your company or scool: abbr."
            },
            11: { txt: 'Turns "bird" into a type of view?' },
            12: { txt: "A cheer directed at a member of ΛΘΦ" },
            13: { txt: "Fictional whale hunter" },
            14: { txt: "Opposite of 25-Across" },
            15: { txt: "Feet: Suffix in zoology" },
            18: { txt: '"That Cow" sp.' },
            19: { txt: "One of many in a watch" },
            20: { txt: "Python function input: abbr." },
            21: { txt: "**Year count when payments may be required" },
            29: {
              txt: 'Actress Donna de Matteo of ABC\'s "Desperate Housewives"'
            },
            30: { txt: "Mend, perhaps" },
            31: { txt: "One possible division of the psyche" },
            32: { txt: "It is like a writing desk, as per Lewis Carroll" },
            34: { txt: "Nobunaga, and the rest of his clan" },
            37: { txt: "A discovery or to discover" },
            38: { txt: "Tall, sp." },
            39: { txt: "Amazon offering akin to S3 or EFS" },
            40: { txt: 'Literally translates to "house me"' },
            41: { txt: "Assumed" },
            42: { txt: "Cardinal direction" },
            43: { txt: "Exclamation sometimes said after 12-Across" },
            44: { txt: "Officers, perhaps" },
            48: { txt: "Frequently Meme'ed Vice President" },
            49: { txt: '"The rain was thick _"' },
            52: { txt: "Flee" },
            53: { txt: "Brown, Pale or Golden e.g." },
            54: { txt: "Olive, coconut or mineral e.g." },
            57: { txt: '"Monsters, _"' },
            58: { txt: "Account summary: abbr." },
            61: { txt: "Click the pencil icon, perhaps" },
            62: { txt: 'Texters: "The most amazing experience"' },
            63: { txt: "Envelope letters" },
            64: { txt: "Prepare for a spike" },
            65: { txt: "Drew Brees or Mother Teresa" },
            67: { txt: "Vancouver airport code" },
            68: { txt: "Small coffee order, across the pond, perhaps" },
            69: { txt: "Maraud" },
            70: { txt: 'Edible "Happy Birthday", perhaps' },
            71: { txt: "Certain man or bird" },
            72: { txt: "Can be found in veins" },
            73: { txt: "Transporter of many diseases" },
            76: { txt: "A scrape, in the near future perhaps" },
            77: { txt: "Zilch" },
            78: { txt: "Possible reference before date night" },
            80: { txt: "Mann or Skye, e.g." },
            81: { txt: "Certain man or country" },
            82: { txt: "To some extent, informally" },
            85: { txt: "Open a banana, say" },
            87: { txt: '"Cool!"' },
            88: { txt: "Not MEDs or SMLs" },
            89: { txt: "One _ (young person)" },
            91: { txt: "**Put flowers near a hive?" },
            93: { txt: "**Acronym associated with Big Data" },
            94: { txt: '"I can\'t believe you peed on the carpet!"' },
            96: { txt: "Sack to stow your sports equipment" },
            97: { txt: "1990 Law that was the impetus for many ramps" },
            98: { txt: "Not no" },
            101: { txt: "Pit:Date; _:Pumpkin" },
            102: { txt: "One of 3 on the iPhone 11" },
            106: { txt: "0 or 1's" },
            107: { txt: "**Advantage" },
            108: { txt: "Woodland creatures" },
            109: { txt: "One of the top holiday destinations in India" },
            110: { txt: "Liturgical vestment" },
            111: { txt: "Rain shadow of the Tibetan Plateau" },
            112: { txt: "Branch of medicine that puts people under: abbr." },
            114: { txt: "Bygone Swedish car manufacturer" },
            115: { txt: "Fall _ cliff (plummet)" },
            119: { txt: "Economic snapshot: abbr." },
            121: { txt: "Sugar suffix" },
            122: { txt: "A pop" }
          }
        }
      }
    };
  }
};
</script>
