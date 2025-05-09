// src/auth/auth0-provider.js
import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

// src/auth/protected-route.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loading from '../components/Loading';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();

  if (isLoading) {
    return <Loading />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// src/auth/admin-route.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loading from '../components/Loading';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated && user) {
        try {
          // Get the permissions from the access token
          const token = await getAccessTokenSilently();
          
          // In a more comprehensive setup, you might want to call your API
          // to validate if the user has admin permissions
          // For now, we'll check if the user has the admin role in Auth0
          
          // Auth0 includes roles in the user object
          const userRoles = user['https://bioinformaticshub.com/roles'] || [];
          const hasAdminRole = userRoles.includes('admin');
          
          setIsAdmin(hasAdminRole);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
        setIsCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  if (isLoading || isCheckingAdmin) {
    return <Loading />;
  }

  // Check if user is authenticated and is an admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// src/components/LoginButton.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={() => loginWithRedirect()}
    >
      Log In
    </button>
  );
};

export default LoginButton;

// src/components/LogoutButton.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      className="text-gray-600 hover:text-gray-800 font-medium"
      onClick={() => logout({ returnTo: window.location.origin })}
    >
      Log Out
    </button>
  );
};

export default LogoutButton;

// src/utils/api.js
// API utility to handle authentication and API calls
export const fetchWithAuth = async (url, options = {}) => {
  try {
    // Get the access token from Auth0
    const { getAccessTokenSilently } = useAuth0();
    const token = await getAccessTokenSilently();
    
    // Add the token to the Authorization header
    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    };
    
    // Make the API call
    const response = await fetch(url, authOptions);
    
    // Handle errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }
    
    // Return the response
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};