import fetch from "node-fetch";
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { GetLastBlock, NodeBody } from "./src/client";

// Configure the OTLP exporter
const collectorEndpoint = 'http://localhost:4318/v1/metrics';
// Function to send metrics to OTLP
async function sendMetric(lastBlock: number) {
    const payload = {
        resource_metrics: [
            {
                resource: {
                    attributes: [
                        { key: 'service.name', value: { string_value: 'eth-metrics-service' } },
                    ],
                },
                metrics: [
                    {
                        name: 'last_block',
                        description: 'The last block number from the Ethereum node',
                        unit: '1',
                        dataPoints: [
                            {
                                value: lastBlock,
                                timestamp: Date.now() * 1_000_000, // Convert to nanoseconds
                                attributes: {},
                            },
                        ],
                    },
                ],
            },
        ],
    };

    try {
        const response = await fetch(collectorEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Failed to send metric: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('Metric sent successfully:', responseData);
    } catch (error) {
        console.error('Error sending metric:', error);
    }
}

const start = async () => {
    // have your code here
    try {
        const lastBlock = await GetLastBlock();
        await sendMetric(lastBlock);
        console.log('Last Block:', lastBlock);
    } catch (error) {
        console.error('Error fetching last block:', error);
    }
};

start();