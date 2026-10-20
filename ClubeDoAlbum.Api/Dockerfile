# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia o csproj e restaura dependências
COPY ["ClubeDoAlbum.Api/ClubeDoAlbum.Api.csproj", "ClubeDoAlbum.Api/"]
RUN dotnet restore "ClubeDoAlbum.Api/ClubeDoAlbum.Api.csproj"

# Copia todo o código fonte e compila em modo Release
COPY . .
WORKDIR "/src/ClubeDoAlbum.Api"
RUN dotnet publish "ClubeDoAlbum.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ClubeDoAlbum.Api.dll"]
