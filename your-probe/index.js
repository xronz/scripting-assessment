"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
const exporter_metrics_otlp_http_1 = require("@opentelemetry/exporter-metrics-otlp-http");
const client_1 = require("./src/client");
// Configuration
const PROBE_FREQ = 5000; // 5 seconds
const EXPORTER_ENDPOINT = 'http://localhost:4318/v1/metrics'; // Exporter endpoint address
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    // have your code here
    // Initialize the OpenTelemetry MeterProvider
    const meterProvider = new sdk_metrics_1.MeterProvider();
    // Create an OTLP Metric Exporter
    const exporter = new exporter_metrics_otlp_http_1.OTLPMetricExporter({
        url: EXPORTER_ENDPOINT,
        headers: {},
    });
    // Set up a PeriodicExportingMetricReader to send metrics every 5 seconds
    const metricReader = new sdk_metrics_1.PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: PROBE_FREQ
    });
    meterProvider.addMetricReader(metricReader);
    // Create a meter
    const meter = meterProvider.getMeter('block-meter');
    // Create a counter metric for block observer
    const blockObserver = meter.createObservableCounter('latest-block-meter', {
        description: 'fetched eth latest block'
    });
    // Add callback to the observable counter to fetch the latest block number
    blockObserver.addCallback((result) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const blockNumber = yield (0, client_1.GetLastBlock)();
            result.observe(blockNumber, {});
            console.log(`Latest Block Number: ${blockNumber}`);
        }
        catch (error) {
            console.error('Failed to fetch latest block number:', error);
        }
    }));
    console.log("start latest block number probe...");
    // Keep the process alive with a heartbeat log
    setInterval(() => {
        console.log('awaiting latest block number probe result... ');
    }, PROBE_FREQ);
    // Graceful shutdown handler
    const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Received shutdown signal, shutting down gracefully...');
        yield meterProvider.shutdown();
        console.log("Cleaned up metrics");
        process.exit(0);
    });
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
});
start();
