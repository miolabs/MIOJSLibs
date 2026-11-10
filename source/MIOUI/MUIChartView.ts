import { Chart } from 'chart.js'
import { MUIView } from "./MUIView";
import { MUICoreLayerAddStyle } from '.';

export enum MUIChartViewType {
    Bar,
    HorizontalBar,
    Line,
    Pie
}

export class MUIChartView extends MUIView {

    title = "";

    // One colour per value, from a palette of twelve (the four brand colours first): with more values
    // the palette starts again from its first colour. Chart.js paints a value without a colour in
    // its default grey, so the list always has one per value; a palette set in
    // backgroundChartColors / borderChartColors is cycled the same way.
    static readonly palette = [
        "0, 191, 191", "255, 211, 88", "75, 204, 255", "255, 86, 113",
        "140, 110, 230", "120, 200, 90", "255, 150, 60", "230, 110, 190",
        "60, 130, 220", "190, 170, 60", "110, 120, 140", "240, 120, 90",
    ];

    static colors(count:number, alpha:number) : string[] {
        let base = MUIChartView.palette.map(c => "rgba(" + c + ", " + alpha + ")");
        return MUIChartView.cycled(base, count);
    }

    // The colours repeated from the first until there is one per value
    static cycled(colors:string[], count:number) : string[] {
        if (colors == null || colors.length == 0) return [];
        let list:string[] = [];
        for (let i = 0; i < count; i++) list.push(colors[i % colors.length]);
        return list;
    }

    backgroundChartColors:string[] = null;
    borderChartColors:string[] = null;

    // Bar charts write each bar's value, rounded (34k, 1,2M), above it
    showValueLabels = true;

    // The value axis (y for bars and lines, x for horizontal bars) and the grid lines (one per step
    // and one per column); off, the chart shows only the bars, their labels and the categories
    showValueAxis = true;

    // 34k, 1,2M, 950: short enough to sit above a bar
    static shortValue(value:number) : string {
        let v = Number(value);
        if (isNaN(v) || v == 0) return "";
        let abs = Math.abs(v);
        if (abs >= 1000000) return (v / 1000000).toFixed(1).replace(".", ",").replace(",0", "") + "M";
        if (abs >= 1000) return Math.round(v / 1000) + "k";
        return String(Math.round(v));
    }

    // Chart.js 2 plugin: draws the short value over (vertical bars) or after (horizontal bars) each bar
    private static valueLabelsPlugin(horizontal:boolean) {
        return {
            afterDatasetsDraw: function (chart:any) {
                let ctx = chart.ctx;
                ctx.save();
                ctx.font = "11px sans-serif";
                ctx.fillStyle = "#4d4e60";
                ctx.textAlign = horizontal ? "left" : "center";
                ctx.textBaseline = horizontal ? "middle" : "bottom";
                chart.data.datasets.forEach(function (dataset:any, d:number) {
                    let meta = chart.getDatasetMeta(d);
                    if (meta.hidden) return;
                    // a line series over the bars: its points carry no labels
                    if (dataset.type == "line") return;
                    meta.data.forEach(function (bar:any, i:number) {
                        let text = MUIChartView.shortValue(dataset.data[i]);
                        if (text.length == 0) return;
                        let p = bar._model;
                        if (horizontal) ctx.fillText(text, p.x + 4, p.y);
                        else ctx.fillText(text, p.x, p.y - 3);
                    });
                });
                ctx.restore();
            }
        };
    }

    labels = null;
    values = null;

    // Several values per label (due vs real...): one series each, with its title, drawn side by
    // side in one colour per series and a legend. With it set, values is not used. A series of
    // type Line on a bar chart is drawn as a line over the bars (dark, so it reads over any bar
    // colour), in front of them and without value labels. A null value leaves a gap (a line
    // stops there: months still to come).
    // style, for a line: "area" fills it down to zero, green above zero and red below (the line
    // and points too), "forecast" is dashed in the colour of the series before it (its
    // continuation; after an area, green/red as well), "strong" is dark.
    // With series and the value axis shown, the axis has short values (34k) and a marked zero line.
    series:{ title:string, values:number[], type?:MUIChartViewType, style?:string }[] = null;

    static readonly lineSeriesColor = "77, 78, 96";
    static readonly positiveColor = "46, 170, 110";
    static readonly negativeColor = "228, 87, 87";

    // Chart.js 2 plugin: a dataset marked _bySign gets its line and area coloured by the side of
    // the zero line they are on: a gradient with a hard stop where zero is drawn (set once the
    // scales are laid out, before the datasets take their colours)
    private static signColorsPlugin() {
        let gradient = (ctx:any, area:any, zeroY:number, alpha:number) => {
            let g = ctx.createLinearGradient(0, area.top, 0, area.bottom);
            let stop = Math.min(1, Math.max(0, (zeroY - area.top) / Math.max(1, area.bottom - area.top)));
            let up = "rgba(" + MUIChartView.positiveColor + ", " + alpha + ")";
            let down = "rgba(" + MUIChartView.negativeColor + ", " + alpha + ")";
            g.addColorStop(0, up); g.addColorStop(stop, up);
            g.addColorStop(stop, down); g.addColorStop(1, down);
            return g;
        };
        return {
            afterLayout: function (chart:any) {
                let scale = chart.scales["y-axis-0"];
                if (scale == null) return;
                let zeroY = scale.getPixelForValue(0);
                chart.data.datasets.forEach(function (dataset:any) {
                    if (!dataset._bySign) return;
                    dataset.borderColor = gradient(chart.ctx, chart.chartArea, zeroY, 1);
                    if (dataset.fill) dataset.backgroundColor = gradient(chart.ctx, chart.chartArea, zeroY, 0.18);
                });
            }
        };
    }

    static signColor(value:number, alpha:number) : string {
        return "rgba(" + (value < 0 ? MUIChartView.negativeColor : MUIChartView.positiveColor) + ", " + alpha + ")";
    }

    private canvas = null;
    private chartLayer = null;


    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

        // this.canvas = MUILayerGetFirstElementWithTag(this.layer, "CANVAS");
        // if (this.canvas == null) {
        //     this.canvas = document.createElement("canvas");
        //     this.canvas.style.width = "100%";
        //     this.canvas.style.height = "100%";
        //     this.layer.appendChild(this.canvas);
        // }
    }

    private createCanvas(){
        this.canvas = document.createElement("canvas");
        MUICoreLayerAddStyle(this.canvas, "mui-chart-view-canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.layer.appendChild(this.canvas);
    }

    private destroyCanvas() {
        this.layer.removeChild(this.canvas);
        this.canvas = null;
    }

    renderWithType(type:MUIChartViewType) {

        let typeName = this.nameFromChartType(type);
        let values = this.values;
        let count = Math.max(1, values?.length ?? 0);
        let bgColors = this.backgroundChartColors != null ? MUIChartView.cycled(this.backgroundChartColors, count) : MUIChartView.colors(count, 0.6);
        let fgColors = this.borderChartColors != null ? MUIChartView.cycled(this.borderChartColors, count) : MUIChartView.colors(count, 0.9);
        let labels = this.labels;
        let opts = this.optionsForChartType(type, this.title);
        let datasets:any[] = [{
            data: values,
            backgroundColor: bgColors,
            borderColor: fgColors,
            borderWidth: 1
        }];
        if (this.series != null && this.series.length > 0) {
            // one colour per series (not per value), and the legend names them
            let seriesBg = this.backgroundChartColors != null ? MUIChartView.cycled(this.backgroundChartColors, this.series.length) : MUIChartView.colors(this.series.length, 0.6);
            let seriesFg = this.borderChartColors != null ? MUIChartView.cycled(this.borderChartColors, this.series.length) : MUIChartView.colors(this.series.length, 0.9);
            let isBarChart = type == MUIChartViewType.Bar;
            let lineColors:string[] = [];
            datasets = this.series.map((s, i) => {
                let isLine = (isBarChart && s.type == MUIChartViewType.Line) || type == MUIChartViewType.Line;
                if (!isLine) {
                    lineColors.push(seriesFg[i]);
                    return {
                        label: s.title,
                        data: s.values,
                        backgroundColor: seriesBg[i],
                        borderColor: seriesFg[i],
                        borderWidth: 1,
                        fill: false,
                        order: 1
                    };
                }
                // a line over bars, or a "strong" one: dark; a forecast: the colour of the line before it
                let rgb = MUIChartView.palette[i % MUIChartView.palette.length];
                if (isBarChart || s.style == "strong") rgb = MUIChartView.lineSeriesColor;
                let color = "rgba(" + rgb + ", 1)";
                if (this.borderChartColors != null) color = seriesFg[i];
                if (s.style == "forecast" && i > 0) color = lineColors[i - 1];
                lineColors.push(color);
                let dataset = {
                    type: "line",
                    label: s.title,
                    data: s.values,
                    borderColor: color,
                    backgroundColor: color,
                    pointBackgroundColor: color,
                    borderWidth: 2,
                    pointRadius: 3,
                    lineTension: isBarChart ? 0.25 : 0,
                    fill: false,
                    order: 0          // drawn in front of the bars
                };
                // an area (and the forecast that continues it) is green above zero and red below
                let bySign = s.style == "area" || (s.style == "forecast" && i > 0 && this.series[i - 1].style == "area");
                if (s.style == "area") dataset.fill = "origin" as any;
                if (bySign) {
                    (dataset as any)._bySign = true;
                    (dataset as any).pointBorderColor = s.values.map(v => MUIChartView.signColor(v ?? 0, 1));
                    dataset.pointBackgroundColor = s.values.map(v => MUIChartView.signColor(v ?? 0, 1)) as any;
                }
                if (s.style == "forecast") {
                    (dataset as any).borderDash = [6, 4];
                    dataset.pointBackgroundColor = "#fff";
                }
                return dataset;
            });
            if (this.showValueAxis && type != MUIChartViewType.Pie) {
                // short values on the axis (34k) and the zero line marked: above or below zero reads at once
                let valueAxis = [ {
                    ticks: { maxTicksLimit: 6, fontSize: 13, callback: (v:number) => v == 0 ? "0" : MUIChartView.shortValue(v) },
                    gridLines: { color: "rgba(0, 0, 0, 0.06)", zeroLineColor: "rgba(0, 0, 0, 0.45)", zeroLineWidth: 1.5, drawBorder: false }
                } ];
                let categoryAxis = [ { gridLines: { display: false }, ticks: { fontSize: 13 } } ];
                opts["scales"] = type == MUIChartViewType.HorizontalBar ? { xAxes: valueAxis, yAxes: categoryAxis } : { xAxes: categoryAxis, yAxes: valueAxis };
                opts["tooltips"] = { callbacks: { label: (item:any, d:any) =>
                    d.datasets[item.datasetIndex].label + ": " + Number(item.yLabel).toLocaleString(undefined, { maximumFractionDigits: 0 }) } };
            }
            // the legend in the series' order (the drawing order puts lines first otherwise)
            if (type != MUIChartViewType.Pie) opts["legend"] = { "display": true, "position": "top",
                "labels": { "fontSize": 13, "boxWidth": 28, "padding": 14, "generateLabels": (chart:any) =>
                    (Chart as any).defaults.global.legend.labels.generateLabels(chart).map((item:any) => {
                        // a green/red line: its swatch in green (a gradient would read as noise there)
                        let ds = chart.data.datasets[item.datasetIndex];
                        if (ds._bySign) {
                            item.strokeStyle = MUIChartView.signColor(1, 1);
                            item.fillStyle = ds.fill ? MUIChartView.signColor(1, 0.18) : "#fff";
                        }
                        return item;
                    }).sort((a:any, b:any) => a.datasetIndex - b.datasetIndex) } };
        }
        let data = {
            labels: labels,
            datasets: datasets
            }

        this.clear();

        this.createCanvas();
        let isBar = type == MUIChartViewType.Bar || type == MUIChartViewType.HorizontalBar;
        if (this.showValueAxis == false && type != MUIChartViewType.Pie) {
            // values start at zero; the value axis is not drawn, and neither are the grid lines of
            // either axis (the categories keep their labels)
            let valueAxis = [ { display: false, gridLines: { display: false, drawBorder: false }, ticks: { beginAtZero: true } } ];
            let categoryAxis = [ { gridLines: { display: false, drawBorder: false } } ];
            opts["scales"] = type == MUIChartViewType.HorizontalBar ? { xAxes: valueAxis, yAxes: categoryAxis } : { xAxes: categoryAxis, yAxes: valueAxis };
        }
        let plugins:any[] = isBar && this.showValueLabels ? [ MUIChartView.valueLabelsPlugin(type == MUIChartViewType.HorizontalBar) ] : [];
        if (datasets.some(d => d._bySign)) plugins.push(MUIChartView.signColorsPlugin());
        // room for the labels above (or after) the bars
        // the same space at both sides
        if (plugins.length > 0) opts["layout"] = { padding: type == MUIChartViewType.HorizontalBar ? { left: 8, right: 36 } : { top: 18, left: 8, right: 8 } };
        this.chartLayer = new Chart(this.canvas, {
            type: typeName,
            data: data,
            options: opts,
            plugins: plugins
        } as any);
    }

    clear(){

        if (this.chartLayer != null) {
            this.chartLayer.destroy();
            this.destroyCanvas();
        }        
    }    

    private nameFromChartType(type:MUIChartViewType) {

        var name = null;

        switch (type) {

            case MUIChartViewType.Bar:
                name = "bar";
                break;

            case MUIChartViewType.HorizontalBar:
                name = "horizontalBar";
                break;

            case MUIChartViewType.Line:
                name = "line";
                break;

            case MUIChartViewType.Pie:
                name = "pie";
                break;                
        }

        return name;
    }

    private optionsForChartType(type:MUIChartViewType, title:string) {

        var op = {};

        // an empty title would still keep a blank line above the plot
        if (title != null && title.length > 0){
            op["title"] = {"display": true, "text":title};
        }

        switch (type) {

            case MUIChartViewType.Pie:
                op["legend"] = {"display": true, "position": "right"};       
                break;

            default:
                op["legend"] = {"display": false};
                break;
        }

        return op;
    }

}