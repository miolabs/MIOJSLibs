import { Chart } from 'chart.js'
import { MUIView } from "./MUIView";

export enum MUIChartViewType {
    Bar,
    HorizontalBar,
    Line,
    Pie
}

export class MUIChartView extends MUIView {

    title = "";
    backgroundChartColors = [
        'rgba(0, 191, 191, 0.6)',
        'rgba(255, 211, 88, 0.6)',
        'rgba(75, 204, 255, 0.6)',
        'rgba(255, 86, 113, 0.6)',
    ];

    borderChartColors = [
        'rgba(0, 191, 191, 0.6)',
        'rgba(255, 211, 88, 0.6)',
        'rgba(75, 204, 255, 0.6)',
        'rgba(255, 86, 113, 0.6)',
    ];

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
        let bgColors = this.backgroundChartColors;
        let fgColors = this.borderChartColors;        
        let values = this.values;
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