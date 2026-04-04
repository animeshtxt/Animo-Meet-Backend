import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const getMetrics = async (req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
};

// Custom Gauge for connection check
const heartbeat_metric = new client.Gauge({
  name: "animo_meet_backend_diagnostic_heartbeat",
  help: "A constant value to prove Grafana is connected to Animo-Meet",
});

heartbeat_metric.set(2004);

export default getMetrics;
