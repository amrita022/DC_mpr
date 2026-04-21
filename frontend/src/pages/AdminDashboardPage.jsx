import React, { useState, useEffect, useContext } from "react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const getStatusBadgeColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'healthy':
      return 'bg-green-500 bg-opacity-20 text-green-400';
    case 'degraded':
      return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
    case 'confirmed':
      return 'bg-green-500 bg-opacity-20 text-green-400';
    case 'cancelled':
      return 'bg-red-500 bg-opacity-20 text-red-400';
    default:
      return 'bg-red-500 bg-opacity-20 text-red-400';
  }
};

export default function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("status");
  const [nodes, setNodes] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [logicalClockTime, setLogicalClockTime] = useState(0);
  const [allBookings, setAllBookings] = useState([]);
  const [eventId, setEventId] = useState("");
  const [numberOfRequests, setNumberOfRequests] = useState(10);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);

  // Redirect if not admin
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Fetch system status
  const fetchSystemStatus = async () => {
    try {
      const response = await api.get("/api/distributed/status");
      setNodes(response.data.nodes);
      setSystemHealth(response.data.systemHealth);
      setLogicalClockTime(response.data.logicalClockTime);
      setLoadingStatus(false);
    } catch (error) {
      toast.error("Failed to fetch system status");
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all bookings
  const fetchAllBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await api.get("/api/bookings/all");
      setAllBookings(response.data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchAllBookings();
    }
  }, [activeTab]);

  const handleNodeFailure = async (nodeId) => {
    try {
      await api.post("/api/distributed/simulate/failure", { nodeId });
      toast.success("Node marked as failed");
      await fetchSystemStatus();
    } catch (error) {
      toast.error("Failed to simulate node failure");
    }
  };

  const handleNodeRecovery = async (nodeId) => {
    try {
      await api.post("/api/distributed/simulate/recovery", { nodeId });
      toast.success("Node recovered");
      await fetchSystemStatus();
    } catch (error) {
      toast.error("Failed to recover node");
    }
  };

  const handleSimulateConcurrent = async () => {
    if (!eventId) {
      toast.error("Please enter an event ID");
      return;
    }

    setSimulating(true);
    try {
      const response = await api.post("/api/distributed/simulate/concurrent", {
        eventId,
        numberOfRequests: parseInt(numberOfRequests),
      });
      setSimulationResults(response.data);
      toast.success("Simulation completed!");
    } catch (error) {
      toast.error("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="w-full min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-dark-border border-t-brand rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-dark py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          {systemHealth && (
            <div className={`px-4 py-2 rounded-btn font-semibold text-sm ${getStatusBadgeColor(systemHealth.systemStatus)}`}>
              {systemHealth.systemStatus.toUpperCase()}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-12 border-b border-dark-border pb-0">
          {["status", "bookings", "simulate"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-semibold transition relative ${
                activeTab === tab
                  ? "text-brand"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab === "status"
                ? "System Status"
                : tab === "bookings"
                ? "All Bookings"
                : "Simulate Load"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "status" && (
          <div className="space-y-8">
            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-dark-card border border-dark-border rounded-card p-6"
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    {node.name}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusBadgeColor(node.status)}`}>
                        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Port</span>
                      <span className="text-white font-mono">{node.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Requests</span>
                      <span className="text-white font-bold">{node.requestCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Load</span>
                      <span className="text-yellow-400 font-bold">{node.load}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => 
                      node.status === "healthy" 
                        ? handleNodeFailure(node.id) 
                        : handleNodeRecovery(node.id)
                    }
                    className={`w-full py-2 rounded-btn font-semibold transition ${
                      node.status === "healthy"
                        ? "bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30"
                        : "bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30"
                    }`}
                  >
                    {node.status === "healthy" ? "Kill Node" : "Recover"}
                  </button>
                </div>
              ))}
            </div>

            {/* System Info Cards */}
            {systemHealth && (
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-dark-card border border-dark-border rounded-card p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Total Nodes</p>
                  <p className="text-4xl font-bold text-white">
                    {systemHealth.totalNodes}
                  </p>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-card p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Healthy</p>
                  <p className="text-4xl font-bold text-green-400">
                    {systemHealth.healthyNodes}
                  </p>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-card p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">Failed</p>
                  <p className="text-4xl font-bold text-red-400">
                    {systemHealth.failedNodes}
                  </p>
                </div>
              </div>
            )}

            {/* Logical Clock */}
            <div className="bg-dark-card border border-dark-border rounded-card p-6">
              <p className="text-gray-400 text-sm mb-2">Logical Clock Time</p>
              <p className="text-5xl font-bold text-brand">
                #{logicalClockTime}
              </p>
            </div>
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="bg-dark-card border border-dark-border rounded-card overflow-hidden">
            {loadingBookings ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 border-4 border-dark-border border-t-brand rounded-full animate-spin mx-auto"></div>
              </div>
            ) : allBookings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Seats
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {allBookings.map((booking) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-dark-secondary transition"
                      >
                        <td className="px-6 py-4 text-gray-300 text-sm">{booking.userId}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {booking.eventId?.name}
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{booking.seats}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          ₹{booking.totalAmount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 font-mono text-gray-300 text-sm">
                          {booking.confirmationCode.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "simulate" && (
          <div className="space-y-8">
            {/* Input Section */}
            <div className="bg-dark-card border border-dark-border rounded-card p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Simulate Concurrent Load
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Event ID
                  </label>
                  <input
                    type="text"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="Enter event ID..."
                    className="w-full bg-dark border border-dark-border rounded-btn text-white placeholder-gray-600 focus:border-brand outline-none transition px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Number of Concurrent Requests
                  </label>
                  <input
                    type="number"
                    value={numberOfRequests}
                    onChange={(e) => setNumberOfRequests(e.target.value)}
                    min="1"
                    max="100"
                    className="w-full bg-dark border border-dark-border rounded-btn text-white focus:border-brand outline-none transition px-4 py-3"
                  />
                </div>

                <button
                  onClick={handleSimulateConcurrent}
                  disabled={simulating}
                  className="w-full bg-brand hover:bg-red-500 disabled:bg-gray-700 text-white font-bold py-4 rounded-btn transition"
                >
                  {simulating ? "RUNNING SIMULATION..." : "RUN SIMULATION"}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {simulationResults && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-dark-card border border-dark-border rounded-card p-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">Total Requests</p>
                    <p className="text-4xl font-bold text-white">
                      {simulationResults.totalRequests}
                    </p>
                  </div>
                  <div className="bg-dark-card border border-dark-border rounded-card p-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">Successful</p>
                    <p className="text-4xl font-bold text-green-400">
                      {simulationResults.successfulBookings}
                    </p>
                  </div>
                  <div className="bg-dark-card border border-dark-border rounded-card p-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">Failed</p>
                    <p className="text-4xl font-bold text-red-400">
                      {simulationResults.failedBookings}
                    </p>
                  </div>
                </div>

                {/* Execution Time */}
                <div className="bg-dark-card border border-dark-border rounded-card p-6">
                  <p className="text-gray-400 text-sm mb-2">Execution Time</p>
                  <p className="text-3xl font-bold text-brand">
                    {simulationResults.executionTime}ms
                  </p>
                </div>

                {/* Node Distribution */}
                <div className="bg-dark-card border border-dark-border rounded-card p-6">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Request Distribution
                  </h3>
                  <div className="space-y-4">
                    {nodes.map((node) => {
                      const handled = simulationResults.results.filter(
                        (r) => r.nodeId === node.id
                      ).length;
                      const percentage = (
                        (handled / simulationResults.totalRequests) *
                        100
                      ).toFixed(1);

                      return (
                        <div key={node.id}>
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-gray-300">
                              {node.name}
                            </span>
                            <span className="text-brand font-bold">
                              {handled} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-dark-border rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-brand to-red-500 h-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
