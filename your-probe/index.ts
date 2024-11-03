import fetch from "node-fetch";
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { GetLastBlock, NodeBody } from "./src/client";

// Configuration
const PROBE_FREQ = (process.env.PROBE_FREQ?Number(process.env.PROBE_FREQ):5000); // 5 seconds
const EXPORTER_ENDPOINT = (process.env.EXPORTER_ENDPOINT?process.env.EXPORTER_ENDPOINT:'http://localhost:4318/v1/metrics'); // Exporter endpoint address

const start = async () => {
    // have your code here

    // Initialize the OpenTelemetry MeterProvider
    const meterProvider = new MeterProvider();
    
    // Create an OTLP Metric Exporter
    const exporter = new OTLPMetricExporter({
        url: EXPORTER_ENDPOINT, // Exporter endpoint address
        headers: {},
    });
    console.log(`Exporter Metric to url: ${EXPORTER_ENDPOINT}`)

    // Set up a PeriodicExportingMetricReader to send metrics every 5 seconds
    const metricReader = new PeriodicExportingMetricReader({
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
    blockObserver.addCallback(async(result)=> {
        try {
            const blockNumber = await GetLastBlock();
            result.observe(blockNumber, {});
            console.log(`Latest Block Number: ${blockNumber}`);
        } catch (error) {
            console.error('Failed to fetch latest block number:',error);
        }
    })

    console.log("start latest block number probe...")
    // Keep the process alive with a heartbeat log
    setInterval(()=> {
        console.log('awaiting latest block number probe result... ')
    }, PROBE_FREQ)

    // Graceful shutdown handler
    const gracefulShutdown = async () => {
        console.log('Received shutdown signal, shutting down gracefully...');
        await meterProvider.shutdown();
        console.log("Cleaned up metrics");
        process.exit(0);
    };
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
};

start();