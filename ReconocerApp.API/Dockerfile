# Use the official .NET 9 SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
 
# Set the working directory inside the container
WORKDIR /app
 
# Copy the solution and project files
COPY . .
 
# Ensure the global tools path is in the PATH environment variable
ENV PATH="$PATH:/root/.dotnet/tools"
 
# Restore dependencies
RUN dotnet restore ReconocerApp.API.csproj
 
# Copy the rest of the application files
COPY . ./
 
# Build the application
RUN dotnet publish ReconocerApp.API.csproj -c Release -o /out

# Set the environment variable for the database file

# Use the official .NET 9 runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0
 
# Set the working directory inside the runtime container
WORKDIR /app
 
# Copy the published output from the build stage
COPY --from=build /out .

# Expose the port the application runs on
EXPOSE 8080
 
# Set the entry point for the container
ENTRYPOINT ["dotnet", "ReconocerApp.API.dll"]