CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE TABLE edicoes (
        "Id" uuid NOT NULL,
        "Numero" integer NOT NULL,
        "Tema" character varying(200) NOT NULL,
        "Descricao" text,
        "DataReuniao" date,
        "Status" text NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_edicoes" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE TABLE users (
        "Id" uuid NOT NULL,
        "Nome" character varying(150) NOT NULL,
        "Email" character varying(255) NOT NULL,
        "SenhaHash" text NOT NULL,
        "AvatarUrl" text,
        "IsAdmin" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE TABLE albums (
        "Id" uuid NOT NULL,
        "EdicaoId" uuid,
        "IndicadoPorUserId" uuid,
        "SpotifyId" text,
        "Titulo" character varying(250) NOT NULL,
        "Artista" character varying(250) NOT NULL,
        "AnoLancamento" integer NOT NULL,
        "CapaUrl" text,
        "SpotifyUrl" text,
        "Status" text NOT NULL,
        "NotaMedia" numeric(3,1) NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_albums" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_albums_edicoes_EdicaoId" FOREIGN KEY ("EdicaoId") REFERENCES edicoes ("Id") ON DELETE SET NULL,
        CONSTRAINT "FK_albums_users_IndicadoPorUserId" FOREIGN KEY ("IndicadoPorUserId") REFERENCES users ("Id") ON DELETE SET NULL
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE TABLE avaliacoes (
        "Id" uuid NOT NULL,
        "AlbumId" uuid NOT NULL,
        "UserId" uuid NOT NULL,
        "Nota" numeric(3,1) NOT NULL,
        "Comentario" text,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_avaliacoes" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_avaliacoes_albums_AlbumId" FOREIGN KEY ("AlbumId") REFERENCES albums ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_avaliacoes_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE INDEX "IX_albums_EdicaoId" ON albums ("EdicaoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE INDEX "IX_albums_IndicadoPorUserId" ON albums ("IndicadoPorUserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_avaliacoes_AlbumId_UserId" ON avaliacoes ("AlbumId", "UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE INDEX "IX_avaliacoes_UserId" ON avaliacoes ("UserId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_edicoes_Numero" ON edicoes ("Numero");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    CREATE UNIQUE INDEX "IX_users_Email" ON users ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261019171125_InitialCreate') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261019171125_InitialCreate', '10.0.13');
    END IF;
END $EF$;
COMMIT;

