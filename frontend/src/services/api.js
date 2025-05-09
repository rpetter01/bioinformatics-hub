// src/services/api.js
import { useAuth0 } from '@auth0/auth0-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const useApi = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Helper method to make authenticated API calls
  const callApi = async (endpoint, options = {}) => {
    try {
      let headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is authenticated
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`API error (${endpoint}):`, error);
      throw error;
    }
  };

  // Resources API
  const resourcesApi = {
    // Get all resources (public)
    getResources: () => callApi('/resources'),

    // Get single resource by ID (public)
    getResource: (id) => callApi(`/resources/${id}`),

    // Create new resource (admin only)
    createResource: (resourceData) => callApi('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    }),

    // Update resource (admin only)
    updateResource: (id, resourceData) => callApi(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    }),

    // Delete resource (admin only)
    deleteResource: (id) => callApi(`/resources/${id}`, {
      method: 'DELETE',
    }),
  };

  // Store Button API
  const storeButtonApi = {
    // Get store button configuration (public)
    getStoreButton: () => callApi('/config/store-button'),

    // Update store button configuration (admin only)
    updateStoreButton: (configData) => callApi('/config/store-button', {
      method: 'PUT',
      body: JSON.stringify(configData),
    }),
  };

  // Analytics API
  const analyticsApi = {
    // Get analytics data (admin only)
    getAnalytics: () => callApi('/analytics'),

    // Record page view (public)
    recordPageView: () => callApi('/analytics/page-view', {
      method: 'POST',
    }),

    // Record resource click (public)
    recordResourceClick: (resourceId, resourceName) => callApi('/analytics/resource-click', {
      method: 'POST',
      body: JSON.stringify({ resourceId, resourceName }),
    }),

    // Record search (public)
    recordSearch: (term) => callApi('/analytics/search', {
      method: 'POST',
      body: JSON.stringify({ term }),
    }),

    // Record store button click (public)
    recordStoreButtonClick: () => callApi('/analytics/store-button-click', {
      method: 'POST',
    }),
  };

  // Jobs API - NEW
  const jobsApi = {
    // Get all jobs (public)
    getJobs: () => callApi('/jobs'),
    
    // Search jobs by query
    searchJobs: (query) => callApi(`/jobs/search?query=${encodeURIComponent(query)}`),

    // Record job click (analytics)
    recordJobClick: (jobId, jobTitle, company) => callApi('/analytics/job-click', {
      method: 'POST',
      body: JSON.stringify({ jobId, jobTitle, company }),
    }),
  };

  return {
    resources: resourcesApi,
    storeButton: storeButtonApi,
    analytics: analyticsApi,
    jobs: jobsApi, // Added jobs API
  };
};