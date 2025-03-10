import * as signalR from '@microsoft/signalr';

// Create and export the SignalR connection
export const connection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5000/gameHub')
  .configureLogging(signalR.LogLevel.Information)
  .withAutomaticReconnect()
  .build();

// Start the connection
export const startConnection = async () => {
  try {
    await connection.start();
    console.log('Connected to SignalR hub');
  } catch (err) {
    console.error('Error connecting to hub:', err);
    // Try to reconnect in 5 seconds
    setTimeout(startConnection, 5000);
  }
};