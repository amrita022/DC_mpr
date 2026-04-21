const nodeRegistry = require("./nodeRegistry");

let roundRobinCounter = 0;

const roundRobin = (nodes) => {
  if (nodes.length === 0) throw new Error("No healthy nodes available");

  const selectedNode = nodes[roundRobinCounter % nodes.length];
  roundRobinCounter += 1;
  return selectedNode;
};

const leastConnections = (nodes) => {
  if (nodes.length === 0) throw new Error("No healthy nodes available");

  return nodes.reduce((prev, current) =>
    prev.requestCount < current.requestCount ? prev : current
  );
};

const weightedRandom = (nodes) => {
  if (nodes.length === 0) throw new Error("No healthy nodes available");

  // Calculate weights inversely proportional to load
  const weights = nodes.map((node) => {
    const baseWeight = 100;
    return Math.max(1, baseWeight - node.load * 10); // Lower load = higher weight
  });

  // Calculate total weight
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  // Generate random number and select node based on weights
  let random = Math.random() * totalWeight;
  for (let i = 0; i < nodes.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return nodes[i];
    }
  }

  return nodes[nodes.length - 1]; // Fallback
};

const selectNode = (strategy = "roundRobin") => {
  const healthyNodes = nodeRegistry.getHealthyNodes();

  if (healthyNodes.length === 0) {
    throw new Error("No healthy nodes available");
  }

  let selectedNode;

  switch (strategy) {
    case "roundRobin":
      selectedNode = roundRobin(healthyNodes);
      break;
    case "leastConnections":
      selectedNode = leastConnections(healthyNodes);
      break;
    case "weightedRandom":
      selectedNode = weightedRandom(healthyNodes);
      break;
    default:
      selectedNode = roundRobin(healthyNodes);
  }

  // Increment request count for selected node
  nodeRegistry.incrementRequestCount(selectedNode.id);

  return selectedNode;
};

module.exports = {
  roundRobin,
  leastConnections,
  weightedRandom,
  selectNode,
};
