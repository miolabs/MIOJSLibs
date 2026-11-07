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
        let data = {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
                borderColor: fgColors,
                borderWidth: 1
                }]
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
        let plugins = isBar && this.showValueLabels ? [ MUIChartView.valueLabelsPlugin(type == MUIChartViewType.HorizontalBar) ] : [];
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

        if (title != null){
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