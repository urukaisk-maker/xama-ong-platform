import { prisma } from "@/lib/prisma";
import Sorteo from "./Sorteo";
import Footer from "./Footer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sorteo = await prisma.sorteo.findFirst({
    orderBy: { id: "desc" },
    include: { numeros: { orderBy: { numero: "asc" } } },
  });

  if (!sorteo) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-cyan-300 font-mono">NO HAY SORTEO</p>
      </main>
    );
  }

  const numeros = sorteo.numeros.map((n) => n.numero);

  return (
    <>
      <Sorteo numeros={numeros} />
      <Footer />
    </>
  );
}
