import Timer from "@/mixins/webgl/Timer.js";

// Saved Data Version
var savedDataVersion = 1;

// Supported Colors
var colors = {
  white: "white",
  black: "black",
  gray: "gray"
};

// Supported Shapes
var shapes = {
  circle: "circle"
};

// [s]pecial [Char]acters
var sChars = {
  black: "#",
  null: "_",
  seq: "|",
  eq: "=",
  diffAcrossVsDown: ":"
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
    date,
    solnArr,
    across,
    down,
    theme = "",
    note = "",
    opts = {}
  ) {
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
    this.theme = theme;
    this.note = note;

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
    if (opts.colorCells) {
      for (let c of opts.colorCells) {
        if (c[2] in colors) {
          this.puzzle[c[0]][c[1]].color = colors[c[2]];
        } else {
          throw "Color [" + c[2] + "] not supported";
        }
      }
    }

    // list of (r, c, shape) of special supported shapes
    if (opts.shapeCells) {
      for (let s of opts.shapeCells) {
        if (s[2] in shapes) {
          this.puzzle[s[0]][s[1]].shape = shapes[s[2]];
        } else {
          throw "Shape [" + s[2] + "] not supported";
        }
      }
    }

    // If speial numbering is passed

    // flag to tell if the puzzle has been completed
    this.completed = false;
    this.filled = false;
    this.stats = {};
    this.statData = this.initStatData();
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
    return this.isInputColorCell(this.puzzle[r][c]);
  }
  isInputColorCell(cell) {
    return colors.black != cell.color;
  }
  isFilled(clue) {
    for (const cell of clue.ctx) {
      if (!cell.entry) {
        return false;
      }
    }
    return true;
  }
  isCorrect(clue) {
    for (const cell of clue.ctx) {
      if (!this.isCellCorrect(cell)) {
        return false;
      }
    }
    return true;
  }
  isCellCorrect(cell) {
    return cell.entry === cell.ans;
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
  isAllFilled() {
    return (
      this.filledCount("across") === Object.keys(this.across).length &&
      this.filledCount("down") === Object.keys(this.down).length
    );
  }
  isLastCell(cell) {
    let clue = this.getClue(cell);
    let lastCell = clue.ctx[clue.ctx.length - 1];
    return cell.r === lastCell.r && cell.c === lastCell.c;
  }
  getClue(cell) {
    return this.isHoriz ? this.across[cell.acrossNum] : this.down[cell.downNum];
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
  getFullClueContext(clue) {
    let fullContext = [];
    try {
      let simpleContext = this.getClueContext(
        clue.index.r,
        clue.index.c,
        clue.isHoriz
      );
      for (const ctx of simpleContext) {
        let cell = this.puzzle[ctx[0]][ctx[1]];
        fullContext.push(cell);
      }
    } catch {
      console.warn("Ill formed clue: ", clue);
    }
    return fullContext;
  }

  //
  // Mutators
  //
  incrementPosition(skipFilled) {
    let isClueFilled = this.updateClueFlags(this.getCell());
    if (isClueFilled || this.isLastCell(this.getCell())) {
      this.moveClue(true, skipFilled);
    } else {
      let d = { r: this.isHoriz ? 0 : 1, c: this.isHoriz ? 1 : 0 };
      this.move(d, skipFilled);
    }
  }
  updateClueFlags(cell) {
    let acrossClue = this.across[cell.acrossNum];
    acrossClue.correct = this.isCorrect(acrossClue);
    acrossClue.filled = this.isFilled(acrossClue);

    let downClue = this.down[cell.downNum];
    downClue.correct = this.isCorrect(downClue);
    downClue.filled = this.isFilled(downClue);

    // Update filled
    this.filled = this.isAllFilled();

    return this.isHoriz ? acrossClue.filled : downClue.filled;
  }
  specialInputIntegrity() {
    // Remove speical input if not special
    let cell = this.getCell();
    cell.isSpecialInput = this.isSpecialInput(cell);
  }
  isSpecialInput(cell) {
    return !(cell.entry === "" || cell.entry.match(/^[A-Z]$/));
  }
  enableSpecialEdit() {
    this.getCell().isSpecialInput = true;
  }
  enterChar(ch, skipFilled = false) {
    let cell = this.getCell();
    if (!cell.wasAutoSolved) {
      let origCell = { ...cell };
      if (cell.isSpecialInput) {
        // If we are in a sepcial input cell all characters are valid
        cell.entry += ch;
        this.updateCellWrongFlag(cell);
      } else if (ch.match(/^[A-Z]$/)) {
        // Normally only A-Z are allowed
        cell.entry = ch;
        this.updateCellWrongFlag(cell);
        this.incrementPosition(skipFilled);
      }
      this.updateStatData(origCell, cell);
    }
  }
  backSpaceLogic() {
    // if the original cell was empty move then do it again
    let cell = this.getCell();
    const move = !cell.entry || cell.wasAutoSolved;
    if (move) {
      if (this.isHoriz) {
        this.move({ r: 0, c: -1 });
      } else {
        this.move({ r: -1, c: 0 });
      }
    }
    cell = this.getCell();
    let origCell = { ...cell };
    if (!cell.wasAutoSolved) {
      if (cell.isSpecialInput) {
        // If its special input simply elete end character
        if (cell.entry && !move) {
          cell.entry = cell.entry.slice(0, -1);
        }
      } else {
        cell.entry = "";
      }
      this.updateCellWrongFlag(cell);
      this.bulkUpdateClueFlags();
      this.filled = this.isAllFilled();
      this.updateStatData(origCell, cell);
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
  move(d, skipFilled = false, origCell = {}) {
    // early return incase empty puzzle
    if (
      !this.puzzle ||
      (origCell && origCell.r === this.r && origCell.c === this.c)
    ) {
      return;
    }

    // Infinite recursive check
    if (!origCell) {
      origCell = { r: this.r, c: this.c };
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
    let cell = this.getCell();
    if (!this.isInputColorCell(cell) || (skipFilled && cell.entry)) {
      this.move(d, skipFilled, origCell);
    }
  }
  moveClue(forward = true, skipFilled = false, origClueNum = false) {
    this.specialInputIntegrity();
    const cell = this.getCell();
    const curClueNum = this.isHoriz ? cell.acrossNum : cell.downNum;

    // Recursive protection
    if (curClueNum === origClueNum) {
      return;
    }

    // Get the next clue
    const curClue = this.isHoriz
      ? this.across[curClueNum]
      : this.down[curClueNum];
    const newClueNum = forward ? curClue.next : curClue.prev;
    const newClue = this.isHoriz
      ? this.across[newClueNum]
      : this.down[newClueNum];
    this.r = newClue.index.r;
    this.c = newClue.index.c;

    // Recurse this funciton if skip filled is true and the new clue is filled.
    if (skipFilled) {
      if (!origClueNum) {
        origClueNum = curClueNum;
      }
      if (newClue.filled) {
        this.moveClue(forward, skipFilled, origClueNum);
      } else {
        let cell = this.getCell();
        if (cell.entry) {
          this.incrementPosition(skipFilled);
        }
      }
    }
  }
  clear(flags = false, wrongEntry = false, allEntry = false) {
    for (let row of this.puzzle) {
      for (let cell of row) {
        if (this.isInputColorCell(cell)) {
          if (flags) {
            cell.flag = false;
          }
          let clearWrongFlag = wrongEntry && cell.wrong && cell.entry;
          if (allEntry || clearWrongFlag) {
            let origCell = { ...cell };
            this.clearCell(cell, allEntry);
            if (this.completed) {
              this.timer.reset();
              this.timer.resume();
            }
            this.completed = false;
            if (clearWrongFlag) {
              cell.wasWrongCleared = true;
              this.updateStatData(origCell, cell);
            }
          }
        }
      }
    }
    if (allEntry) {
      this.statData = this.initStatData();
    }
    this.bulkUpdateClueFlags();
    this.filled = this.isAllFilled();
  }
  clearCell(cell, fullClear = false) {
    if (!cell.wasAutoSolved || fullClear) {
      cell.entry = "";
      cell.isSpecialInput = false;
      if (fullClear) {
        cell.wasAutoSolved = false;
        cell.wasShownError = false;
        cell.wasWrongCleared = false;
        cell.wrong = true;
      }
    }
  }
  clearClue() {
    let clue = this.isHoriz
      ? this.across[this.getCell().acrossNum]
      : this.down[this.getCell().downNum];
    for (let cell of clue.ctx) {
      this.clearCell(cell);
    }
    this.bulkUpdateClueFlags();
    this.filled = this.isAllFilled();
  }
  solveCurrentCell() {
    let cell = this.getCell();
    this.solveCell(cell);
    this.bulkUpdateClueFlags();
    this.filled = this.isAllFilled();
  }
  solveCell(cell) {
    let origCell = { ...cell };
    if (!this.isCellCorrect(cell)) {
      cell.entry = cell.ans;
      cell.isSpecialInput = this.isSpecialInput(cell);
      cell.wasAutoSolved = true;
      cell.wrong = false;
    }
    this.updateStatData(origCell, cell);
  }
  solveClue() {
    let clue = this.isHoriz
      ? this.across[this.getCell().acrossNum]
      : this.down[this.getCell().downNum];
    for (let cell of clue.ctx) {
      this.solveCell(cell);
    }
    this.bulkUpdateClueFlags();
    this.filled = this.isAllFilled();
  }
  solvePuzzle() {
    for (let row of this.puzzle) {
      for (let cell of row) {
        if (this.isInputColorCell(cell)) {
          this.solveCell(cell);
        }
      }
    }
    this.bulkUpdateClueFlags();
    this.generateStats();
    this.timer.pause();
    this.filled = true;
    this.completed = true;
  }

  //
  // Stat Functions
  //
  generateStats() {
    // except for numTrulySolved... this is all now duplicated in the statData object... oh well.
    this.stats = {
      totalCells: 0,
      inputCells: 0,
      numAutoSolved: 0,
      numShownError: 0,
      numCleared: 0,
      numTrulySolved: 0,
      time: this.timer.getTimeSec(true)
    };
    for (let row of this.puzzle) {
      for (let cell of row) {
        this.stats.totalCells++;
        this.stats.inputCells += this.isInputColorCell(cell) ? 1 : 0;
        this.stats.numAutoSolved += cell.wasAutoSolved ? 1 : 0;
        this.stats.numShownError += cell.wasShownError ? 1 : 0;
        this.stats.numCleared += cell.wasWrongCleared ? 1 : 0;
        this.stats.numTrulySolved +=
          !this.isInputColorCell(cell) ||
          cell.wasAutoSolved ||
          cell.wasShownError ||
          cell.wasWrongCleared
            ? 0
            : 1;
      }
    }
  }
  initStatData() {
    return {
      filledCount: 0,
      timeSeries: [[0, 0, 0, 0, 0, 0]],
      correctCount: 0,
      autoSolvedCount: 0,
      shownErrorCount: 0,
      wrongCleardCount: 0
    };
  }
  updateStatData(origCell, cell) {
    let newData = false;

    // Update filled counts
    if (!origCell.entry && cell.entry) {
      this.statData.filledCount += 1;
      newData = true;
    } else if (origCell.entry && !cell.entry) {
      this.statData.filledCount -= 1;
      newData = true;
    }

    // Update correct counts
    if (origCell.wrong && !cell.wrong) {
      this.statData.correctCount += 1;
      newData = true;
    } else if (!origCell.wrong && cell.wrong) {
      this.statData.correctCount -= 1;
      newData = true;
    }

    // Update was auto solved
    if (cell.wasAutoSolved && !origCell.wasAutoSolved) {
      this.statData.autoSolvedCount += 1;
      newData = true;
    }

    // Update was wrong cleared
    if (cell.wasWrongCleared && !origCell.wasWrongCleared) {
      this.statData.wrongCleardCount += 1;
      newData = true;
    }

    // Update the was shown error
    if (cell.wasShownError && !origCell.wasShownError) {
      this.statData.shownErrorCount += 1;
      newData = true;
    }

    if (newData) {
      this.statData.timeSeries.push([
        this.timer.getTimeSec(true),
        this.statData.filledCount,
        this.statData.correctCount,
        this.statData.autoSolvedCount,
        this.statData.shownErrorCount,
        this.statData.wrongCleardCount
      ]);
    }
    //console.log(this.statData.timeSeries.join(" | "));
  }
  //
  // Initialization Functions
  //
  buildPuzzle(solnArr) {
    this.puzzle = [];
    let clueNumber = 1;

    // Loop across the provided solution to create relations
    for (let r = 0; r < solnArr.length; r++) {
      const row = solnArr[r];
      let sequenceStarted = false;
      let seq = [];
      this.puzzle.push([]);

      // Loop across each column
      let adj = 0;
      for (let c = 0; c < row.length; c++) {
        let ch = row[c];

        // Special Logic is more than a single character is in a cell
        if (sequenceStarted) {
          adj++;
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
            continue;
          }
        }

        const color = ch === sChars.black ? colors.black : colors.white;

        // White Cells have more metadata
        let aNum = null; // The relevant across clue number
        let dNum = null; // The relavant down clue number
        let cellNum = null; // THe actual number that belongs if the cell (if it )

        if (color != colors.black) {
          aNum = this.getAcrossNumber(r, c - 1 - adj);
          aNum = aNum ? aNum : clueNumber;
          dNum = this.getDownNumber(r - 1, c - adj);
          dNum = dNum ? dNum : clueNumber;

          // if this cell will have a number on the final crossword
          if (dNum == clueNumber || aNum == clueNumber) {
            if (dNum == clueNumber) {
              try {
                this.down[clueNumber].index = { r: r, c: c - adj };
              } catch {
                console.error(
                  "Ill-formatted puzzle no clue for: [" + clueNumber + "-Down]"
                );
              }
            }
            if (aNum == clueNumber) {
              try {
                this.across[clueNumber].index = { r: r, c: c - adj };
              } catch {
                console.error(
                  "Ill-formatted puzzle no clue for: [" +
                    clueNumber +
                    "-Across]"
                );
              }
            }
            cellNum = clueNumber;
            clueNumber++;
          }
        }

        this.puzzle[r].push(
          this.createPuzzleElement(
            ch,
            aNum,
            dNum,
            cellNum,
            color,
            undefined,
            r,
            c - adj
          )
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
        let clue = clueList[k];
        clue.prev = prev;
        clue.next = next;
        clue.filled = false;
        clue.correct = false;
        clue.isHoriz = isHoriz;
        clue.showContext = false;
        prev = k;
        i++;
        next = cKeys[i % cKeys.length];
        // Contexts
        clue.ctx = this.getFullClueContext(clue, isHoriz);
      }
    }
  }
  createPuzzleElement(ans, acrossNum, downNum, cellNum, color, shape, r, c) {
    var puzzleElement = {
      ans: ans, // The correct answer in this cell
      entry: "", // The user inputted text
      color: color, // The background color
      shape: shape, // If a shape is used in rendering
      acrossNum: acrossNum, // the number of the across clue
      downNum: downNum, // the number of the down clue
      cellNum: cellNum, // If this cell will have a clue number in it
      flag: false, // Has this cell been manually flagged?
      isSpecialInput: false, // Does this cell have special input?
      wasAutoSolved: false,
      wasShownError: false,
      wasWrongCleared: false,
      timeCorrect: -1,
      wrong: true,
      r: r,
      c: c
    };
    return puzzleElement;
  }
  bulkUpdateClueFlags() {
    for (let k of Object.keys(this.across)) {
      let clue = this.across[k];
      clue.filled = this.isFilled(clue);
      clue.correct = this.isCorrect(clue);
    }
    for (let k of Object.keys(this.down)) {
      let clue = this.down[k];
      clue.filled = this.isFilled(clue);
      clue.correct = this.isCorrect(clue);
    }
  }
  updateCellWrongFlag(cell) {
    cell.wrong = cell.entry != cell.ans;
  }
  updateShownErrorFlag(r, c) {
    let cell = this.puzzle[r][c];
    let origCell = { ...cell };
    cell.wasShownError = true;
    this.updateStatData(origCell, cell);
  }

  //
  // Saving Functions
  //
  saveData() {
    return {
      version: savedDataVersion,
      time: this.timer.getTime(),
      completed: this.completed,
      cellData: this.getCellDataToSave(),
      stats: this.stats,
      statData: this.statData
    };
  }
  getCellDataToSave() {
    let cellData = [];
    for (const row of this.puzzle) {
      cellData.push([]);
      for (const cell of row) {
        cellData[cellData.length - 1].push({
          e: cell.entry,
          f: cell.flag,
          was: cell.wasAutoSolved,
          wse: cell.wasShownError,
          wwc: cell.wasWrongCleared,
          si: cell.isSpecialInput
        });
      }
    }
    return cellData;
  }
  reloadSavedData(savedData) {
    console.log("Attempting to load progress...", savedData);
    if (savedData.version && savedData.version === savedDataVersion) {
      try {
        this.completed = savedData.completed;
        this.timer.addTime(savedData.time);
        this.stats = savedData.stats ? savedData.stats : {};
        this.statData = savedData.statData ? savedData.statData : this.statData;
        if (this.completed) {
          this.timer.pause();
        }
        for (const row of this.puzzle) {
          for (const cell of row) {
            cell.entry = savedData.cellData[cell.r][cell.c].e;
            cell.entry = cell.entry ? cell.entry : "";
            cell.flag = savedData.cellData[cell.r][cell.c].f;
            cell.wasAutoSolved = savedData.cellData[cell.r][cell.c].was;
            cell.wasShownError = savedData.cellData[cell.r][cell.c].wse;
            cell.wasWrongCleared = savedData.cellData[cell.r][cell.c].wwc;
            cell.isSpecialInput = savedData.cellData[cell.r][cell.c].si;
            this.updateCellWrongFlag(cell);
          }
          // Make sure clue and filled relations are correct
          this.bulkUpdateClueFlags();
          this.filled = this.isAllFilled();
        }
        console.log("Progress Sucesfully loaded");
      } catch {
        // Oh well...
        console.warn("Failed to load progress. Sorry 'bout it");
      }
    } else {
      console.log(
        "...progress was unversioned or had incompatible version. Disregarding progress. Sorry!"
      );
    }
  }
}
