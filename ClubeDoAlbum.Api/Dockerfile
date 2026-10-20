# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["ClubeDoAlbum.Api.csproj", "./"]
RUN dotnet restore "ClubeDoAlbum.Api.csproj"

COPY . .
RUN dotnet publish "ClubeDoAlbum.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ClubeDoAlbum.Api.dll"]
