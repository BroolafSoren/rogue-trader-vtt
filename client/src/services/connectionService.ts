import * as signalR from '@microsoft/signalr';
import { HubConnectionState } from '@microsoft/signalr';

// Create and export the SignalR connection
export const connection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5000/gameHub')
  .configureLogging(signalR.LogLevel.Information)
  .withAutomaticReconnect()
  .build();

// Start the connection
export const startConnection = async () => {
  try {
    if (connection.state !== HubConnectionState.Disconnected) {
        console.log(`Hub connection is already in ${connection.state} state, not starting again`);
        return;
      }
    await connection.start();
    console.log('Connected to SignalR hub');
  } catch (err) {
    console.error('Error connecting to hub:', err);
    // Try to reconnect in 5 seconds
    setTimeout(startConnection, 5000);
  }
};