using RogueTraderVTT.Hubs;
using Microsoft.AspNetCore.SignalR;
using src.models;
using MongoDB.Driver;
using Microsoft.AspNetCore.Cors;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;

var builder = WebApplication.CreateBuilder(args);

// Add the CORS conventions for MongoDB
var conventionPack = new ConventionPack
{
    new CamelCaseElementNameConvention(),
    new IgnoreExtraElementsConvention(true)
};
ConventionRegistry.Register("CustomConventions", conventionPack, t => true);

// Replace your existing CORS configuration with this
builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRPolicy", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Critical for dev environment
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

// Add services to the container.
builder.Services.AddControllers() // This is crucial!
    .AddJsonOptions(options =>
    {
        // Use camelCase property naming to match TypeScript expectations
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register SignalR AFTER CORS but BEFORE other services
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true; // Enable detailed errors
    options.MaximumReceiveMessageSize = 102400; // 100 KB
});

// Register the character repository with MongoDB
string mongoConnectionString = builder.Configuration.GetConnectionString("MongoDB") ?? "mongodb://mongodb:27017/roguetrader";
builder.Services.AddSingleton<ICharacterRepository>(new MongoCharacterRepository(mongoConnectionString));

// Rest of your service configuration...

// Fix the middleware ordering
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

// CRITICAL: First UseRouting, then UseCors
app.UseRouting();

// Remove the duplicate UseCors call and use the SignalR policy
app.UseCors("SignalRPolicy");

// Debug middleware can stay
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request received: {context.Request.Method} {context.Request.Path}");
    await next.Invoke();
});

app.UseAuthorization();

// Map endpoints after all middleware is configured
app.MapControllers(); // No need for RequireCors here since we're using global middleware
app.MapHub<GameHub>("/gameHub");

app.MapGet("/diagnostics/ping", () => "pong");
app.Map("/", () => "Rogue Trader VTT API is running!");

app.Run();
