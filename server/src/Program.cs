using RogueTraderVTT.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); // This is crucial!
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Keep your existing SignalR setup
builder.Services.AddSignalR(); // Keep this!

// For development, enable CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.WithOrigins("http://localhost:5173") // Your React app's development URL
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials(); // Important for SignalR
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseHttpsRedirection();
app.UseAuthorization();

// Map controllers BEFORE the fallback to SPA
app.MapControllers();

// Keep your existing SignalR hub mappings
app.MapHub<GameHub>("/gameHub"); // Keep this!

// If you have SPA fallback middleware, it should come AFTER MapControllers
// app.UseSpa(...);

app.Run();
