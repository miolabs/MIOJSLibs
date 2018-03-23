// Browser specific additions
declare interface Window {
    webkitURL?: any;
}

// Webpack worker-loader module
declare module "worker-loader?*" {
    class WebpackWorker extends Worker {
        constructor();
    }
    export = WebpackWorker;
}