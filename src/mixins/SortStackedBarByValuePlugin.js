/*
 * Adapted From:
 *    https://stackoverflow.com/questions/51323890/chart-js-stacked-bar-chart-sorting-values-in-bar-by-value
 *
 * ChartJs does not support sorting of stacked bar charts by value, so manually loop datasets ot properly set
 * the base and height of each stack
 */

export const SortStackedBarByValue = {
  // afterInit: () => {},
  // beforeUpdate: () => {},
  // afterUpdate: () => {},
  // beforeLayout: () => {},
  // afterLayout: () => {},
  // beforeDatasetsUpdate: () => {},
  afterDatasetsUpdate(chart) {
    applySortedStacks(chart);
  },
  // beforeDatasetUpdate: () => {},
  // afterDatasetUpdate: () => {},
  // beforeRender: () => {},
  // afterRender: () => {},
  beforeDraw(chart) {
    createSortedStacks(chart);
  },
  // afterDraw: () => {},
  // beforeDatasetsDraw: () => {},
  // afterDatasetsDraw: () => {},
  // beforeDatasetDraw: () => {},
  // afterDatasetDraw: () => {},
  // beforeEvent: () => {},
  // afterEvent: () => {},
  // resize: () => {},
};

const applySortedStacks = (chart) => {
  if (chart.options.splitStat && chart.sortedData) {
    // Ensure that our caculated "y" and "base" values are properly set
    chart.data.datasets.forEach((_, di) => {
      chart.getDatasetMeta(di).data.forEach((data, index) => {
        const currentData = chart.sortedData[index].data;
        const el = currentData.find((e) => e.datasetIndex === di);
        data._model.y = el.y;
        data._model.base = el.base;
      });
    });
  }
};

const createSortedStacks = (chart) => {
  if (chart.options.splitStat) {
    chart.sortedData = []; // create data container within the chart object

    // Loop data once to build a sortable object with all the relevant properties saved in relevaent lists
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      dataset.data.forEach((value, index) => {
        if (!chart.sortedData[index]) chart.sortedData.push({ data: [] });

        const datasetMeta = chart.getDatasetMeta(datasetIndex);
        chart.sortedData[index].data.push({
          datasetIndex,
          hidden: datasetMeta.hidden || false,
          color: dataset.backgroundColor,
          value,
          y: datasetMeta.data[index]._model.y,
          base: datasetMeta.data[index]._model.base,
        });
      });
    });

    // Full chart properties
    const chartTop = chart.scales["y-axis-0"].top;
    const max = chart.scales["y-axis-0"].max; // Max Value of the chart
    const dhDr = chart.scales["y-axis-0"].height / max; // ratio of a unit value to the canvas space it takes up

    // Loop a second time to calculate the relative baselines and heights
    chart.sortedData.forEach((sortedEntry) => {
      const currentData = sortedEntry.data;
      currentData.sort((a, b) => a.value - b.value);

      // Calculate the canvas baseline where the stack will start to be painted
      const valueSum = currentData
        .filter((d) => !d.hidden)
        .reduce((a, b) => a + b.value, 0);
      const initialBase = chartTop + (max - valueSum) * dhDr;

      currentData.forEach((d, i) => {
        // calculate base of this stack starting at a baseline and increasing with values of previous records
        d.base = initialBase;
        for (let j = 0; j < i; j++) {
          d.base += currentData[j].hidden ? 0 : currentData[j].value * dhDr;
        }

        // Set the "y" value with is the "top" of this stack
        d.y = d.base + d.value * dhDr;
      });
    });
  } else {
    chart.sortedData = undefined;
  }
};
