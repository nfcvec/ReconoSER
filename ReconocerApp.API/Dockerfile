# Use the official .NET 9 SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy the solution and project files
COPY . .
 
# Install the dotnet-ef tool
RUN dotnet tool install --global dotnet-ef
 
# Ensure the global tools path is in the PATH environment variable
ENV PATH="$PATH:/root/.dotnet/tools"
 
# Restore dependencies
RUN dotnet restore ReconocerApp.API.csproj
 
# Copy the rest of the application files
COPY . ./
 
# Build the application
RUN dotnet publish ReconocerApp.API.csproj -c Release -o /out
 
# Set the environment variable for SQLite database path
ENV ConnectionStrings__DefaultConnection="Data Source=/app/reconocer.db"
ENV DatabaseProvider="Sqlite"
ENV Logging__LogLevel__Default="Information"
ENV Logging__LogLevel__Microsoft.AspNetCore="Warning"
ENV AllowedHosts="*"

# Add migrations
RUN dotnet ef migrations add InitialCreate --project ReconocerApp.API.csproj --startup-project ReconocerApp.API.csproj

# Update the database
RUN dotnet ef database update --project ReconocerApp.API.csproj --startup-project ReconocerApp.API.csproj

# Use the official .NET 9 runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0
 
# Set the working directory inside the runtime container
WORKDIR /app
 
# Copy the published output from the build stage
COPY --from=build /out .

# Copy the SQLite database file from the build stage
COPY --from=build /app/reconocer.db .

# Expose the port the application runs on
EXPOSE 8080
 
# Set the entry point for the container
ENTRYPOINT ["dotnet", "ReconocerApp.API.dll"]