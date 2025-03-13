import React, { useState } from 'react';
import axios from 'axios';

const ApiDebugPage: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('http://localhost:5000');
  const [endpoint, setEndpoint] = useState('/api/rulebook/debug');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const result = await axios.get(`${baseUrl}${endpoint}`);
      setResponse(result.data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      if (err.response) {
        setResponse({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-debug-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>API Debug Tool</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>API Base URL:</label>
          <input 
            type="text" 
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Endpoint:</label>
          <input 
            type="text" 
            value={endpoint} 
            onChange={(e) => setEndpoint(e.target.value)}
            style={{ width: '100%', padding: '5px', marginTop: '5px' }}
          />
        </div>
        
        <button 
          onClick={testEndpoint}
          disabled={loading}
          style={{ padding: '8px 16px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}
      
      {response && (
        <div>
          <h3>API Response:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Common Test Endpoints:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <button 
              onClick={() => setEndpoint('/api/rulebook/debug')}
              style={{ margin: '5px', padding: '5px 10px' }}
            >
              Debug
            </button>
          </li>
          <li>
            <button 
              onClick={() => setEndpoint('/api/rulebook')}
              style={{ margin: '5px', padding: '5px 10px' }}
            >
              List Rulebooks
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiDebugPage;