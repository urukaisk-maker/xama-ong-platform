import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: './dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existente = await prisma.sorteo.findFirst()

  if (existente) {
    console.log('Ya existe un sorteo, no se crea otro.')
    return
  }

  const sorteo = await prisma.sorteo.create({
    data: {
      nombre: 'Sorteo Solidario XAMA',
      descripcion: 'Cesta de comida solidaria. Sin compra de boletos.',
      premio: 'Cesta de comida',
      estado: 'abierto',
      maxNumeros: 40,
    },
  })

  const numeros = Array.from({ length: 40 }, (_, i) => ({
    sorteoId: sorteo.id,
    numero: i + 1,
    estado: 'disponible',
  }))

  await prisma.numero.createMany({ data: numeros })

  console.log(`Sorteo creado con id ${sorteo.id} y 40 números disponibles.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
