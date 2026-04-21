// In-memory service node registry
const nodes = [
  {
    id: "node-1",
    name: "Booking Worker 1",
    port: 3001,
    status: "healthy",
    load: 0,
    lastHeartbeat: Date.now(),
    requestCount: 0,
  },
  {
    id: "node-2",
    name: "Booking Worker 2",
    port: 3002,
    status: "healthy",
    load: 0,
    lastHeartbeat: Date.now(),
    requestCount: 0,
  },
  {
    id: "node-3",
    name: "Booking Worker 3",
    port: 3003,
    status: "healthy",
    load: 0,
    lastHeartbeat: Date.now(),
    requestCount: 0,
  },
];

const getNodes = () => {
  return nodes;
};

const getHealthyNodes = () => {
  return nodes.filter((node) => node.status === "healthy");
};

const updateNodeLoad = (nodeId, load) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (node) {
    node.load = load;
  }
};

const markNodeDown = (nodeId) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (node) {
    node.status = "failed";
  }
};

const markNodeUp = (nodeId) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (node) {
    node.status = "healthy";
    node.lastHeartbeat = Date.now();
  }
};

const incrementRequestCount = (nodeId) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (node) {
    node.requestCount += 1;
  }
};

const resetNodes = () => {
  nodes.forEach((node) => {
    node.status = "healthy";
    node.load = 0;
    node.requestCount = 0;
    node.lastHeartbeat = Date.now();
  });
};

module.exports = {
  getNodes,
  getHealthyNodes,
  updateNodeLoad,
  markNodeDown,
  markNodeUp,
  incrementRequestCount,
  resetNodes,
};
