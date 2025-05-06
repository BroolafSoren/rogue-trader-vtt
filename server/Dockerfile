FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["src/src.csproj", "./"]
RUN dotnet restore "src.csproj"

# Copy all files and build
COPY ["src/", "./"]
RUN dotnet build "src.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "src.csproj" -c Release -o /app/publish

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Copy the assets folder from the source context into the container's /app/assets directory
COPY assets ./assets

# Explicitly set environment variables
ENV ASPNETCORE_URLS=http://0.0.0.0:80
ENV ASPNETCORE_ENVIRONMENT=Development

EXPOSE 80
ENTRYPOINT ["dotnet", "src.dll"]