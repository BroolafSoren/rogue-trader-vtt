using Microsoft.AspNetCore.SignalR;
using RogueTraderVTT.Models;

namespace RogueTraderVTT.Hubs
{
    public class GameHub : Hub
    {
        // This will store our tokens (in a real app, use a service)
        private static List<Token> _tokens = new List<Token>();

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await Clients.Caller.SendAsync("tokens-update", _tokens);
            await base.OnConnectedAsync();
        }

        public async Task CreateToken(Token newToken)
        {
            _tokens.Add(newToken);
            await Clients.All.SendAsync("token-created", newToken);
        }

        public async Task MoveToken(Token token)
        {
            var index = _tokens.FindIndex(t => t.Id == token.Id);
            if (index >= 0)
            {
                _tokens[index] = token;
                await Clients.All.SendAsync("tokens-update", _tokens);
            }
        }

        public async Task ConfirmMovement(string tokenId, double newX, double newY)
        {
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
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }
    }
}