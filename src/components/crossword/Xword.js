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
  seq: "|",
  eq: "="
};

export default class Xword {
  /**
   * Xword is a helper class for all the important Xword Functions
   * @constructor
   */
  constructor(title, author, editor, date, solnArr, across, down, opts = {}) {
    if (opts.debug) {
      console.log("Initializing crossword '" + title + "' by: " + author);
    }
    this.isHoriz = true;
    this.title = title;
    this.author = author;
    this.editor = editor;
    this.publishDate = new Date(
      parseInt(date.substring(0, 4)),
      parseInt(date.substring(4, 6)) - 1,
      parseInt(date.substring(6, 8))
    );
    this.timer = new Timer(true);
    this.across = across;
    this.down = down;
    this.filled = {
      across: 0,
      down: 0
    };

    // Process the solition array into a usable puzzle
    this.puzzle = [];
    this.buildPuzzle(solnArr);
    this.processClueList(this.across, true);
    this.processClueList(this.down, false);

    this.r = 0;
    this.c = 0;
    let aKeys = Object.keys(this.across).sort(function(a, b) {
      parseInt(a) - parseInt(b);
    });
    if (aKeys.length > 0) {
      let idx = this.across[aKeys[0]].index;
      this.r = idx.r;
      this.c = idx.c;
    }

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
    this.updateHack = 1;
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
  getClueContext(r, c, isHoriz) {
    let d = isHoriz ? { r: 0, c: 1 } : { r: 1, c: 0 };
    var ctx = [[r, c]];
    r += d.r;
    c += d.c;
    while (this.isInputCell(r, c)) {
      ctx.push([r, c]);
      r += d.r;
      c += d.c;
    }
    return ctx;
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
  isFilled(r, c, isHoriz) {
    const ctxs = this.getClueContext(r, c, isHoriz);
    for (const ctx of ctxs) {
      if (!this.puzzle[ctx[0]][ctx[1]].entry) {
        return false;
      }
    }
    return true;
  }
  filledCount(direction) {
    let cnt = 0;
    for (const c of Object.values(this[direction])) {
      if (c.filled) {
        cnt++;
      }
    }
    return cnt;
  }

  //
  // Mutators
  //
  incrementPosition() {
    if (this.updateFilled()) {
      this.moveClue(true);
    } else {
      let d = { r: this.isHoriz ? 0 : 1, c: this.isHoriz ? 1 : 0 };
      this.move(d);
    }
  }
  updateFilled() {
    let ret = false;
    let cell = this.getCell();
    let b = this.isFilled(
      this.across[cell.acrossNum].index.r,
      this.across[cell.acrossNum].index.c,
      true
    );
    this.filled.across += this.across[cell.acrossNum].filled ? -1 : 0;
    this.filled.across += b ? 1 : 0;
    this.across[cell.acrossNum].filled = b;
    if (this.isHoriz) {
      ret = b;
    }
    b = this.isFilled(
      this.down[cell.downNum].index.r,
      this.down[cell.downNum].index.c,
      false
    );
    this.filled.down += this.down[cell.downNum].filled ? -1 : 0;
    this.filled.down += b ? 1 : 0;
    this.down[cell.downNum].filled = b;
    if (!this.isHoriz) {
      ret = b;
    }
    return ret;
  }
  specialInputIntegrity() {
    // Remove speical input if not special
    if (this.getCell().entry.match(/^[A-Z]$/) || !this.getCell().entry) {
      this.getCell().isSpecialInput = false;
    }
  }
  enableSpecialEdit() {
    this.getCell().isSpecialInput = true;
  }
  enterChar(ch) {
    let cell = this.getCell();
    if (cell.isSpecialInput) {
      // If we are in a sepcial input cell all characters are valid
      cell.entry += ch;
    } else if (ch.match(/^[A-Z]$/)) {
      // Normally only A-Z are allowed
      cell.entry = ch;
      this.incrementPosition();
    }
  }
  toggleCellFlag() {
    this.getCell().flag = !this.getCell().flag;
  }
  setPosition(r, c) {
    this.specialInputIntegrity();
    this.r = r;
    this.c = c;
  }
  move(d) {
    // early return incase empty puzzle
    if (!this.puzzle) {
      return;
    }

    this.specialInputIntegrity();

    this.r += d.r;
    this.c += d.c;

    // Keep the r,c in bounds
    if (this.r >= this.puzzle.length) {
      this.r = 0;
      this.c = (this.c + 1) % this.puzzle[this.r].length;
    } else if (this.r < 0) {
      this.r = this.puzzle.length - 1;
      this.c = this.c === 0 ? this.puzzle[this.r].length - 1 : this.c - 1;
    } else if (this.c >= this.puzzle[this.r].length) {
      this.c = 0;
      this.r = (this.r + 1) % this.puzzle.length;
    } else if (this.c < 0) {
      this.r = this.r === 0 ? this.puzzle.length - 1 : this.r - 1;
      this.c = this.puzzle[this.r].length - 1;
    }

    // recurse if not inputable cell
    if (!this.isInputColor(this.r, this.c)) {
      this.move(d);
    }
  }
  moveClue(forward = true) {
    this.specialInputIntegrity();
    const cell = this.getCell();
    const curClue = this.isHoriz
      ? this.across[cell.acrossNum]
      : this.down[cell.downNum];
    const newClueNum = forward ? curClue.next : curClue.prev;
    const newClue = this.isHoriz
      ? this.across[newClueNum]
      : this.down[newClueNum];
    this.r = newClue.index.r;
    this.c = newClue.index.c;
  }
  getFullClueContext(clueList, num, isHoriz) {
    let simpleContext = this.getClueContext(
      clueList[num].index.r,
      clueList[num].index.c,
      isHoriz
    );
    let fullContext = [];
    for (const ctx of simpleContext) {
      let cell = this.puzzle[ctx[0]][ctx[1]];
      let el = {
        color: cell.color,
        isInput: cell.color !== "black",
        downNum: cell.downNum,
        acrossNum: cell.acrossNum,
        num: cell.cellNum,
        entry: cell.entry,
        r: ctx[0],
        c: ctx[1]
      };
      fullContext.push(el);
    }
    return fullContext;
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
            if (dNum == clueNumber) {
              this.down[clueNumber].index = { r: r, c: c };
            }
            if (aNum == clueNumber) {
              this.across[clueNumber].index = { r: r, c: c };
            }
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
      curCell = this.puzzle[r][c].downNum;
      r--;
    }
    return curCell;
  }
  processClueList(clueList, isHoriz) {
    let cKeys = Object.keys(clueList).sort(function(a, b) {
      parseInt(a) - parseInt(b);
    });
    if (cKeys.length > 0) {
      let i = 1;
      let prev = cKeys[cKeys.length - 1];
      let next = cKeys[1 % cKeys.length];
      for (let k of cKeys) {
        clueList[k].prev = prev;
        clueList[k].next = next;
        clueList[k].filled = false;
        prev = k;
        i++;
        next = cKeys[i % cKeys.length];
        // Contexts
        clueList[k].ctx = this.getFullClueContext(clueList, k, isHoriz);
      }
    }
  }
  createPuzzleElement(ans, acrossNum, downNum, cellNum, color, shape) {
    var puzzleElement = {
      ans: ans, // The correct answer in this cell
      entry: "", // The user inputted text
      color: color, // The background color
      shape: shape, // If a shape is used in rendering
      acrossNum: acrossNum, // the number of the across clue
      downNum: downNum, // the number of the down clue
      cellNum: cellNum, // If this cell will have a clue number in it
      flag: false, // Has this cell been manually flagged?
      isSpecialInput: false // Does this cell have special input?
    };
    return puzzleElement;
  }
  bulkUpdateFilled() {
    this.filled = {
      across: 0,
      down: 0
    };
    for (let k of Object.keys(this.across)) {
      let clue = this.across[k];
      clue.filled = this.isFilled(clue.index.r, clue.index.c, true);
      this.filled.across += clue.filled ? 1 : 0;
    }
    for (let k of Object.keys(this.down)) {
      let clue = this.down[k];
      clue.filled = this.isFilled(clue.index.r, clue.index.c, false);
      this.filled.down += clue.filled ? 1 : 0;
    }
  }
}
