const nodeRegistry = require("./nodeRegistry");

let heartbeatInterval;

const startHeartbeat = () => {
  heartbeatInterval = setInterval(() => {
    const allNodes = nodeRegistry.getNodes();

    allNodes.forEach((node) => {
      if (node.status === "healthy") {
        // 90% chance node stays healthy
        if (Math.random() < 0.9) {
          node.lastHeartbeat = Date.now();
        } else {
          // 10% chance node fails
          nodeRegistry.markNodeDown(node.id);
          console.warn(
            `[FAULT] Node ${node.name} (${node.id}) has failed!`
          );
        }
      } else if (node.status === "failed") {
        // 70% chance node recovers
        if (Math.random() < 0.7) {
          nodeRegistry.markNodeUp(node.id);
          console.log(
            `[RECOVERY] Node ${node.name} (${node.id}) has recovered!`
          );
        }
      }
    });
  }, 5000); // Run every 5 seconds
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
};

const getSystemHealth = () => {
  const allNodes = nodeRegistry.getNodes();
  const healthyNodes = nodeRegistry.getHealthyNodes();
  const failedNodes = allNodes.filter((n) => n.status === "failed");

  let systemStatus;
  if (failedNodes.length === 0) {
    systemStatus = "healthy";
  } else if (failedNodes.length === allNodes.length) {
    systemStatus = "critical";
  } else {
    systemStatus = "degraded";
  }

  return {
    totalNodes: allNodes.length,
    healthyNodes: healthyNodes.length,
    failedNodes: failedNodes.length,
    systemStatus,
  };
};

module.exports = {
  startHeartbeat,
  stopHeartbeat,
  getSystemHealth,
};
