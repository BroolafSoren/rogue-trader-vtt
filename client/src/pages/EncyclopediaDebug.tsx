import React, { useState } from 'react';
import axios from 'axios';

const EncyclopediaDebug: React.FC = () => {
  const [apiPath, setApiPath] = useState('/api/rulebook');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await axios.get(apiPath);
      setResponse(result.data);
      console.log('API Response:', result.data);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Encyclopedia API Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          value={apiPath} 
          onChange={(e) => setApiPath(e.target.value)} 
          style={{ width: '60%', padding: '8px', marginRight: '10px' }}
        />
        <button 
          onClick={testApi}
          disabled={loading}
          style={{ padding: '8px 16px' }}
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
            overflowX: 'auto',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Common Test URLs:</h3>
        <ul>
          <li><button onClick={() => setApiPath('/api/rulebook')}>Get All Rulebooks</button></li>
          <li><button onClick={() => setApiPath('/api/rulebook/Rogue Trader - Core-Rulebook/metadata')}>Get Rulebook Metadata</button></li>
          <li><button onClick={() => setApiPath('/api/rulebook/Rogue Trader - Core-Rulebook/pages?startIndex=0&count=2')}>Get First 2 Pages</button></li>
        </ul>
      </div>
    </div>
  );
};

export default EncyclopediaDebug;