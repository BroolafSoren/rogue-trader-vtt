import * as signalR from '@microsoft/signalr';

const HUB_URL = 'http://localhost:3000/gameHub';

console.log('Connecting to SignalR hub at:', HUB_URL);

// Create connection with full transport options and error handling
export const connection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL, {
    skipNegotiation: false,
    transport: signalR.HttpTransportType.WebSockets | 
               signalR.HttpTransportType.ServerSentEvents | 
               signalR.HttpTransportType.LongPolling,
    logMessageContent: true,
  })
  .configureLogging(signalR.LogLevel.Debug)
  .withAutomaticReconnect([0, 1000, 5000, 10000, 30000]) // Progressive retry
  .build();

// Connection management
export const startConnection = async () => {
  console.log('Starting SignalR connection...');
  
  try {
    await connection.start();
    console.log('SignalR connection established successfully');
    
    // Test the connection
    await connection.invoke('SendMessage', 'Connection test from client');
  } catch (err) {
    console.error('Error connecting to SignalR hub:', err);
    // Try to reconnect after a delay
    setTimeout(startConnection, 5000);
  }
};

// Add connection event handlers
connection.onclose((error) => {
  console.log('SignalR connection closed', error);
});

connection.onreconnecting((error) => {
  console.log('SignalR attempting to reconnect', error);
});

connection.onreconnected((connectionId) => {
  console.log('SignalR reconnected with ID:', connectionId);
});

// Example of receiving messages
connection.on('ReceiveMessage', (message) => {
  console.log('Message from server:', message);
});

// Export a clean shutdown function
export const stopConnection = async () => {
  try {
    await connection.stop();
    console.log('SignalR connection stopped');
  } catch (err) {
    console.error('Error stopping connection:', err);
  }
};