<template>
  <div id="crossword">
    <div class="blk-container">
      <div>
        <h2>{{ xwords[curIdx].title }}</h2>
        by {{ xwords[curIdx].author }}, {{ xwords[curIdx].createDate }}
      </div>
      <xword-puzzle :puzzle="curPuzzle" />
      <xword-keyboard :currentCell="curPuzzle[0][0]" />
      <xword-clues :clues="xwords[curIdx].clues.across" title="Across" />
      <xword-clues :clues="xwords[curIdx].clues.down" title="Down" />
    </div>
  </div>
</template>

<script>
import XwordPuzzle from "@/components/crossword/XwordPuzzle.vue";
import XwordClues from "@/components/crossword/XwordClues.vue";
import XwordKeyboard from "@/components/crossword/XwordKeyboard.vue";

// Xword Data Source Imports
import Xword1 from "@/assets/xword/Xword1.vue";

//
var colors = {
  white: "white",
  black: "black",
  gray: "gray"
};

export default {
  name: "crossword",
  components: {
    XwordClues,
    XwordPuzzle,
    XwordKeyboard
  },
  data() {
    return {
      showAcross: false,
      showDown: false,
      xwords: [Xword1.data().xword],
      curPuzzle: [],
      curIdx: 0
    };
  },
  mounted() {
    this.preprocessXword(this.xwords[this.curIdx]);
    this.setPuzzle(this.curIdx);
  },
  methods: {
    setPuzzle(idx) {
      this.curPuzzle = this.xwords[idx].puzzle;
    },
    preprocessXword(xword) {
      if (!xword.started) {
        console.log(
          "Starting crossword '" + xword.title + "' by: " + xword.author
        );

        xword.puzzle = [];
        let clueNumber = 1;
        let b = xword.blackChar;

        // Loop across the provided solution to create relations
        for (let r = 0; r < xword.solution.length; r++) {
          const row = xword.solution[r];
          let sequenceStarted = false;
          let seq = [];
          xword.puzzle.push([]);

          for (let c = 0; c < row.length; c++) {
            let ch = row[c];
            if (sequenceStarted) {
              if (ch === xword.sequenceChar) {
                sequenceStarted = false;
                ch = seq.join(""); // Multiple character entry
              } else {
                seq.push(ch);
                continue;
              }
            } else {
              if (ch === xword.sequenceChar) {
                sequenceStarted = true;
              }
            }

            let aNum = null;
            let dNum = null;
            let cellNum = null;

            const color = this.colorFunc(ch, b, r, c, xword.colorCells);
            if (color != colors.black) {
              // cache the relevant clues numbers
              aNum = this.getAcrossNumber(xword.puzzle, r, c - 1);
              aNum = aNum ? aNum : clueNumber;
              dNum = this.getDownNumber(xword.puzzle, r - 1, c);
              dNum = dNum ? dNum : clueNumber;

              // if this cell will have a number on the final crossword
              if (dNum == clueNumber || aNum == clueNumber) {
                cellNum = clueNumber;
                clueNumber++;
              }
            }

            // Uncommon shape accent
            const shape = this.shapeFunc(r, c, xword.shapeCells);

            xword.puzzle[r].push(
              this.createPuzzleElement(ch, aNum, dNum, cellNum, color, shape)
            );
          }
        }
      }
    },
    getAcrossNumber(puzzle, r, c) {
      var curCell = null;
      while (this.isInputCell(puzzle, r, c)) {
        curCell = puzzle[r][c].acrossNum;
        c--;
      }
      return curCell;
    },
    getDownNumber(puzzle, r, c) {
      var curCell = null;
      while (this.isInputCell(puzzle, r, c)) {
        curCell = puzzle[r][c].acrossNum;
        r--;
      }
      return curCell;
    },
    colorFunc(ch, blackChar, r, c, colorCells) {
      var col = colors.white;
      if (ch === blackChar) {
        col = colors.black;
      }
      if (colorCells && colorCells[r] && colorCells[r][c]) {
        col = colorCells[r][c];
      }
      return col;
    },
    shapeFunc(r, c, shapeCells) {
      let shp = null;
      if (shapeCells && shapeCells[r] && shapeCells[r][c]) {
        shp = shapeCells[r][c];
      }
      return shp;
    },
    createPuzzleElement(ans, acrossNum, downNum, cellNum, color, shape) {
      var puzzleElement = {
        ans: ans, // The correct answer in this cell
        entry: "", // The user inputted text
        color: color, // The background color
        shape: shape, // If a shape is used in rendering
        acrossNum: acrossNum, // the number of the across clue
        downNum: downNum, // the number of the down clue
        cellNum: cellNum
      };
      return puzzleElement;
    },
    processClue(clue, r, c) {
      clue.filled = false;
      clue.correct = false;
      clue.rowStart = r;
      clue.colStart = c;
    },
    getClueContext(puzzle, r, c, d) {
      // d should either be {r: 0, c: -1} or {r: -1, c: 0}
      var clueContext = [puzzle[r][c].entry];
      while (this.isInputCell(puzzle, r, c)) {
        clueContext.push(puzzle[r][c].entry);
        r += d.r;
        c += d.c;
      }
      return clueContext;
    },
    isInputCell(puzzle, r, c) {
      if (r >= puzzle.length || r < 0) {
        return false;
      }
      if (c >= puzzle[r].length || c < 0) {
        return false;
      }
      return colors.black != puzzle[r][c].color;
    }
  }
};
</script>

<style lang="scss" scoped>
#crossword {
  .blk-container {
    max-width: 500px;
    width: 100%;
  }
}
</style>
