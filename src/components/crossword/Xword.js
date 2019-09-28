import Timer from "@/mixins/webgl/Timer.js";

// Supported Colors
var colors = {
  white: "white",
  black: "black",
  gray: "gray"
};

// Supported Shapes
var shapes = {};

// [s]pecial [Char]acters
var sChars = {
  black: "#",
  null: "_",
  seq: "|"
};

export default class Xword {
  /**
   * Xword is a helper class for all the important Xword Functions
   * @constructor
   */
  constructor(
    title,
    author,
    editor,
    publishDate,
    solnArr,
    across,
    down,
    opts = {}
  ) {
    if (opts.debug) {
      console.log("Initializing crossword '" + title + "' by: " + author);
    }
    this.r = 0;
    this.c = 0;
    this.isHoriz = true;
    this.title = title;
    this.author = author;
    this.editor = editor;
    this.publishDate = publishDate;
    this.timer = new Timer(true);
    this.across = across;
    for (let k of Object.keys(this.across)) {
      this.across[k].filled = false;
    }
    this.down = down;
    for (let k of Object.keys(this.down)) {
      this.down[k].filled = false;
    }
    this.rcAdjust = {};

    // Process the solition array into a usable puzzle
    this.puzzle = [];
    this.buildPuzzle(solnArr);

    // list of (r,c, color) of coloring other than black or white
    if (opts.coloredCells) {
      for (let c of opts.coloredCells) {
        if (c[2] in colors) {
          this.puzzle[(c[0], c[1])].color = colors[c[2]];
        } else {
          throw "Color [" + c[2] + "] not supported";
        }
      }
    }

    // list of (r, c, shape) of special supported shapes
    if (opts.shapedCells) {
      for (let s of opts.coloredCells) {
        if (s[2] in shapes) {
          this.puzzle[(s[0], s[1])].shape = shapes[s[2]];
        } else {
          throw "Shape [" + s[2] + "] not supported";
        }
      }
    }

    // If speial numbering is passed

    // Since we have successfully proccessed flag it as such
    this.initialized = true;
  }

  //
  // Getters
  //
  getCell() {
    if (this.r < this.puzzle.length && this.c < this.puzzle[this.r].length) {
      return this.puzzle[this.r][this.c];
    }
    return {};
  }

  isInputCell(r, c) {
    if (r >= this.puzzle.length || r < 0) {
      return false;
    }
    if (c >= this.puzzle[r].length || c < 0) {
      return false;
    }
    return this.isInputColor(r, c);
  }
  isInputColor(r, c) {
    return colors.black != this.puzzle[r][c].color;
  }

  //
  // Mutators
  //
  incrementPosition() {
    let d = { r: this.isHoriz ? 0 : 1, c: this.isHoriz ? 1 : 0 };
    this.move(d);
  }
  move(d) {
    // early return incase empty puzzle
    if (!this.puzzle) {
      return;
    }

    this.r += d.r;
    this.c += d.c;

    // Keep the r,c in bounds
    if (this.r >= this.puzzle.length) {
      this.r = 0;
      this.c = (this.c + 1) % this.puzzle[this.r].length;
    } else if (this.r < 0) {
      this.r = this.puzzle.length - 1;
      console.log("negative r [c]", this.c);
      this.c = this.c === 0 ? this.puzzle[this.r].length - 1 : this.c - 1;
      console.log("negative r [c]", this.c);
    } else if (this.c >= this.puzzle[this.r].length) {
      this.c = 0;
      this.r = (this.r + 1) % this.puzzle.length;
    } else if (this.c < 0) {
      this.r = this.r === 0 ? this.puzzle.length - 1 : this.r - 1;
      console.log("negative c [r]", this.c, this.r);
      this.c = this.puzzle[this.r].length - 1;
      console.log("negative c [r]", this.r);
    }

    // recurse if not inputable cell
    if (!this.isInputColor(this.r, this.c)) {
      this.move(d);
    }
  }

  getClueContext(r, c, d) {
    // d should either be {r: 0, c: -1} or {r: -1, c: 0}
    var clueContext = [];
    while (this.isInputCell(this.puzzle, r, c)) {
      clueContext.push(this.puzzle[r][c].entry);
      r += d.r;
      c += d.c;
    }
    return clueContext;
  }

  //
  // Initialization Functions
  //
  buildPuzzle(solnArr) {
    let clueNumber = 1;

    // Loop across the provided solution to create relations
    for (let r = 0; r < solnArr.length; r++) {
      const row = solnArr[r];
      let sequenceStarted = false;
      let seq = [];
      this.puzzle.push([]);

      // Loop across each column
      for (let c = 0; c < row.length; c++) {
        let ch = row[c];

        // Special Logic is more than a single character is in a cell
        if (sequenceStarted) {
          if (ch === sChars.seq) {
            sequenceStarted = false;
            ch = seq.join(""); // Multiple character entry
          } else {
            seq.push(ch);
            continue;
          }
        } else {
          if (ch === sChars.seq) {
            sequenceStarted = true;
            seq.push(ch);
            continue;
          }
        }

        const color = ch === sChars.black ? colors.black : colors.white;

        // White Cells have more metadata
        let aNum = null; // The relevant across clue number
        let dNum = null; // The relavant down clue number
        let cellNum = null; // THe actual number that belongs if the cell (if it )

        if (color != colors.black) {
          aNum = this.getAcrossNumber(r, c - 1);
          aNum = aNum ? aNum : clueNumber;
          dNum = this.getDownNumber(r - 1, c);
          dNum = dNum ? dNum : clueNumber;

          // if this cell will have a number on the final crossword
          if (dNum == clueNumber || aNum == clueNumber) {
            cellNum = clueNumber;
            clueNumber++;
          }
        }

        this.puzzle[r].push(
          this.createPuzzleElement(ch, aNum, dNum, cellNum, color)
        );
      }
    }
  }
  getAcrossNumber(r, c) {
    let curCell = null;
    while (this.isInputCell(r, c)) {
      curCell = this.puzzle[r][c].acrossNum;
      c--;
    }
    return curCell;
  }
  getDownNumber(r, c) {
    let curCell = null;
    while (this.isInputCell(r, c)) {
      curCell = this.puzzle[r][c].acrossNum;
      r--;
    }
    return curCell;
  }
  createPuzzleElement(ans, acrossNum, downNum, cellNum, color, shape) {
    var puzzleElement = {
      ans: ans, // The correct answer in this cell
      entry: "", // The user inputted text
      color: color, // The background color
      shape: shape, // If a shape is used in rendering
      acrossNum: acrossNum, // the number of the across clue
      downNum: downNum, // the number of the down clue
      cellNum: cellNum // If this cell will have a clue number in it
    };
    return puzzleElement;
  }
}
