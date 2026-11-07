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
        this.chartLayer = new Chart(this.canvas, {
            type: typeName,
            data: data,
            options: opts
        });
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