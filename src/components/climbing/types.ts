import type Stat from "@/utils/Stat";
import type { StatKey } from "@/utils/Stat";
import type { AggregatorName } from "@/utils/Aggregate";
import type { ChartJsData } from "@/utils/Utils";

export interface StatFilterState {
  val: StatKey | null;
  show: boolean;
}

// richer than utils/Stat's StatFilters (adds `show`, for the filter UI) but
// structurally compatible with it - passed directly to Stat.getFiltered()
export type StatFilterMap = Record<string, StatFilterState>;

export interface ColumnDef {
  name: string;
  active: boolean;
}

export interface AggOpts {
  aggregator: AggregatorName | null;
  catagory: string | null;
  value: StatKey | null;
}

export interface ChartOpts {
  sortByName?: boolean;
  limit?: number;
  splitStat?: string | null;
  splitLimit?: number;
  filters?: StatFilterMap;
  title?: string;
  // Chart.js options object, built up ad hoc per chart - too dynamic to
  // usefully type more strictly than this
  chartOpts?: Record<string, unknown>;
  autoGenerateSubtitle?: boolean;
  subtitleFxn?: (stat: Stat) => string;
  aggregateFxn?: (stat: Stat) => number;
  aggregateTitle?: string;
  aggOpts?: AggOpts;
  colors?: Record<string, string>;
  hideChart?: boolean;
}

export interface DynamicChartConfig {
  type: string;
  statBase: string;
  opts: ChartOpts;
}

// the materialized chart object ChartHandler/ChartView/SettingView/AscentView
// all receive as their `chart` prop, built by ClimberAnalysis's createChart()
export interface Chart {
  type: string;
  title?: string;
  subtitle?: string;
  statBase: string;
  opts: ChartOpts;
  chartOpts: Record<string, unknown>;
  chartData: ChartJsData;
}

