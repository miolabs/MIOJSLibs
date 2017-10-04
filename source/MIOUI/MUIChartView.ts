
/// <reference path="MUIView.ts" />


enum MUIChartViewType {
    Bar,
    Line,
    Pie
}

class MUIChartView extends MUIView {

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

    values = null;

    private canvas = null;
    private chartLayer = null;


    initWithLayer(layer, owner, options?) {
        super.initWithLayer(layer, owner, options);

        this.canvas = MUILayerGetFirstElementWithTag(this.layer, "CANVAS");
        if (this.canvas == null) {
            this.canvas = document.createElement("canvas");
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            this.layer.appendChild(this.canvas);
        }
    }

    renderWithType(type:MUIChartViewType) {

        let typeName = this.nameFromChartType(type);
        let bgColors = this.backgroundChartColors;
        let fgColors = this.borderChartColors;
        let title = this.title;
        let values = this.values;

        if (type == null) return;

        this.chartLayer = new Chart(this.canvas, {
            type: typeName,
            data: {
                labels: ["Red", "Blue", "Yellow", "Green"],
                datasets: [{
                    label: title,
                    data: values,
                    backgroundColor: bgColors,
                    borderColor: fgColors,
                    borderWidth: 1
                }]
            }
        });
    }

    private nameFromChartType(type:MUIChartViewType) {

        var name = null;

        switch (type) {

            case MUIChartViewType.Bar:
                name = "bar";
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

}