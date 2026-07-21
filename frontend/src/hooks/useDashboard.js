import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboardData, getHealth } from '../services/api';

export const useDashboard = (pollingInterval = 5000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [timeline, setTimeline] = useState([]);

  // Keep track of seen incident signatures to avoid duplicates in the visual timeline
  const processedIncidents = useRef(new Set());

  const fetchDashboard = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      // 1. Check Backend Connectivity
      try {
        await getHealth();
        setIsConnected(true);
      } catch (e) {
        setIsConnected(false);
      }

      // 2. Fetch Dashboard Metrics
      const dashboardRes = await getDashboardData();
      setData(dashboardRes);
      setError(null);

      // 3. Process new incidents for the timeline
      if (dashboardRes?.zones) {
        const timestamp = dashboardRes.last_updated || new Date().toISOString();
        const newEvents = [];

        dashboardRes.zones.forEach((zone) => {
          // If the zone is not "Safe", track it as a hazard/incident event
          if (zone.incident_type !== 'Safe') {
            const eventSignature = `${zone.zone}-${zone.incident_type}-${zone.risk_score}-${timestamp.substring(0, 16)}`;

            if (!processedIncidents.current.has(eventSignature)) {
              processedIncidents.current.add(eventSignature);
              newEvents.push({
                id: eventSignature,
                timestamp: timestamp,
                zone: zone.zone,
                incident: zone.incident_type,
                riskScore: zone.risk_score,
                severity: zone.risk_score >= 85.0 ? 'Critical' : zone.risk_score >= 70.0 ? 'High' : 'Moderate',
                factors: [...zone.risk_factors]
              });
            }
          }
        });

        if (newEvents.length > 0) {
          setTimeline((prev) => {
            // Keep at most 20 events in the scrolling feed, newest first
            const combined = [...newEvents, ...prev];
            return combined.slice(0, 20);
          });
        }
      }
    } catch (err) {
      console.error("Dashboard fetching error:", err);
      setError(err.message || 'Failed to fetch refinery status telemetry.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Initial fetch and polling set up
  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [fetchDashboard, pollingInterval]);

  const handleRetry = () => {
    fetchDashboard(true);
  };

  return {
    data,
    loading,
    error,
    isConnected,
    timeline,
    handleRetry
  };
};
