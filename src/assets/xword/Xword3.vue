<script>
export default {
  name: "Xword2",
  data() {
    return {
      xword: {
        id: 3,
        title: "Ditto",
        author: "David Vasko*",
        editor: "David Vasko*",
        createDate: "20191001",
        difficulty: 3,
        dimension: "5x5",
        theme: "The nth column is the same as the nth row, ",
        colorCells: [],
        shapeCells: [],
        numbering: [],
        solution: ["CARTS", "ALARM", "RADIO", "TRICK", "SMOKE"],
        clues: {
          across: {
            1: { txt: "Mario racing vehicles" },
            6: { txt: "Alexa in the morning. perhaps" },
            7: { txt: "Type of wave for long distance communication" },
            8: { txt: "'Treat' alternative" },
            9: { txt: "Word before 'Signal' or 'Bomb'" }
          },
          down: {
            1: { txt: "Ditto" },
            2: { txt: "Ditto" },
            3: { txt: "Ditto" },
            4: { txt: "Ditto" },
            5: { txt: "Ditto" }
          }
        }
      }
    };
  }
};
</script>
