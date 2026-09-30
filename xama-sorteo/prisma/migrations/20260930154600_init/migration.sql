-- CreateTable
CREATE TABLE "Sorteo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "premio" TEXT NOT NULL,
    "fechaSorteo" DATETIME,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "maxNumeros" INTEGER NOT NULL DEFAULT 40,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Participante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "consentimiento" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Numero" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sorteoId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "participanteId" INTEGER,
    "fechaAsignacion" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Numero_sorteoId_fkey" FOREIGN KEY ("sorteoId") REFERENCES "Sorteo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Numero_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "Participante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Numero_sorteoId_numero_key" ON "Numero"("sorteoId", "numero");
