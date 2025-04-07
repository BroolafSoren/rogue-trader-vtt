import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiDebugger() {
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCharacterApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/characters/debug');
      setApiStatus(response.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testCharacterApi();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>API Connection Diagnostics</h2>
      
      {loading && <p>Testing API connection...</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffeeee', borderRadius: '4px' }}>
          <h3>Connection Error</h3>
          <p>{error}</p>
          <p>Make sure your server is running at http://localhost:5000</p>
        </div>
      )}
      
      {apiStatus && (
        <div style={{ backgroundColor: '#eeffee', padding: '10px', borderRadius: '4px' }}>
          <h3>API Connection Successful</h3>
          <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
        </div>
      )}
      
      <button 
        onClick={testCharacterApi} 
        style={{ marginTop: '10px', padding: '5px 10px' }}
        disabled={loading}
      >
        Test API Connection Again
      </button>
    </div>
  );
}