using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using RogueTraderVTT.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace RogueTraderVTT.Hubs
{
    public class GameHub : Hub
    {
        // This will store our tokens (in a real app, use a service)
        private static List<Token> _tokens = new List<Token>();
        private readonly ILogger<GameHub> _logger;

        public GameHub(ILogger<GameHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
            Console.WriteLine($"Client connected: {Context.ConnectionId}"); // Extra logging
            await Clients.Caller.SendAsync("tokens-update", _tokens);
            await base.OnConnectedAsync();
        }

        public async Task CreateToken(Token newToken)
        {
            Console.WriteLine($"Creating token: {newToken.Id}");
            _tokens.Add(newToken);
            await Clients.All.SendAsync("token-created", newToken);
        }

        public async Task MoveToken(Token token)
        {
            Console.WriteLine($"Moving token: {token.Id}");
            var index = _tokens.FindIndex(t => t.Id == token.Id);
            if (index >= 0)
            {
                _tokens[index] = token;
                await Clients.All.SendAsync("tokens-update", _tokens);
            }
        }

        public async Task ConfirmMovement(string tokenId, double newX, double newY)
        {
            Console.WriteLine($"Confirming movement for token: {tokenId}");
            var token = _tokens.FirstOrDefault(t => t.Id == tokenId);
            if (token != null)
            {
                token.X = newX;
                token.Y = newY;
                token.Waypoints.Clear();
                await Clients.All.SendAsync("token-moved", token);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
            if (exception != null)
            {
                _logger.LogError(exception, "Client disconnected with error: {ConnectionId}", Context.ConnectionId);
                Console.WriteLine($"Client disconnected with error: {Context.ConnectionId}, {exception}");
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Test method to verify hub is working
        public async Task SendMessage(string message)
        {
            _logger.LogInformation("Received message: {Message}", message);
            Console.WriteLine($"Received message: {message}");
            await Clients.All.SendAsync("ReceiveMessage", $"Server received: {message}");
        }
    }
}