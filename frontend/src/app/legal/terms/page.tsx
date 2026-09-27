import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong, developer, legal } = SITE_CONFIG;

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-6">
        <Link
          href="/public"
          className="mb-6 inline-block text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
        >
          ← Volver a la portada
        </Link>

        <article className="rounded-2xl bg-white p-8 shadow-sm md:p-12 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Términos de uso
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: {legal.lastUpdated}
          </p>

          <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
            <h2>1. Objeto</h2>
            <p>
              Los presentes Términos de uso regulan el acceso y la utilización
              de la plataforma digital de <b>{ong.name}</b> (en adelante, "la
              Plataforma"), accesible desde el sitio web oficial de la entidad.
              El uso de la Plataforma implica la aceptación plena y sin reservas
              de estos Términos.
            </p>

            <h2>2. Titular</h2>
            <p>
              La Plataforma es titularidad de <b>{ong.fullName}</b>, con
              domicilio en {ong.address} y correo electrónico de contacto{" "}
              {ong.email}.
            </p>

            <h2>3. Acceso y uso</h2>
            <p>
              El acceso a la Plataforma es gratuito. Algunas secciones
              (inventario, familias, cuadrantes, etc.) requieren autenticación
              mediante usuario y contraseña, asignados por la Junta Directiva o              los coordinadores de sede.
            </p>
            <p>El usuario se compromete a:</p>
            <ul>
              <li>Hacer un uso lícito y diligente de la Plataforma.</li>
              <li>No introducir datos falsos, incompletos o fraudulentos.</li>
              <li>No compartir sus credenciales con terceros.</li>
              <li>No realizar acciones que puedan dañar la Plataforma o la
                información contenida en ella.</li>
            </ul>

            <h2>4. Finalidad</h2>
            <p>
              La Plataforma tiene como finalidad facilitar la gestión logística
              de la recuperación de alimentos, el control de caducidades, la
              asignación de turnos de voluntariado y la distribución a familias
              beneficiarias en Reus y Tarragona.
            </p>

            <h2>5. Propiedad intelectual</h2>
            <p>
              El código fuente de la Plataforma es de código abierto y se
              distribuye bajo licencia MIT, disponible en el repositorio
              público de GitHub. Los contenidos, marcas y logotipos son
              propiedad de {ong.name} o de sus respectivos titulares.
            </p>

            <h2>6. Protección de datos</h2>
            <p>
              El tratamiento de datos personales se rige por lo dispuesto en
              nuestra{" "}
              <Link href="/legal/privacy" className="text-emerald-600 underline dark:text-emerald-400">
                Política de privacidad
              </Link>
              .
            </p>

            <h2>7. Responsabilidad</h2>
            <p>
              {ong.name} no se responsabiliza de los daños derivados del mal uso
              de la Plataforma ni de las interrupciones del servicio por causas
              técnicas ajenas a su control.
            </p>

            <h2>8. Modificaciones</h2>
            <p>
              {ong.name} se reserva el derecho a modificar los presentes
              Términos en cualquier momento. Las modificaciones entrarán en
              vigor desde su publicación en la Plataforma.
            </p>

            <h2>9. Legislación aplicable</h2>
            <p>
              Estos Términos se rigen por la legislación española. Cualquier
              controversia se someterá a los Juzgados y Tribunales de{" "}
              {ong.city}.
            </p>

            <h2>10. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con estos Términos, puedes
              escribir a <a href={`mailto:${ong.email}`} className="text-emerald-600 underline dark:text-emerald-400">{ong.email}</a>.
            </p>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Desarrollado por{" "}
            <a
              href={developer.projects[0]?.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {developer.name}
            </a>{" "}
            · {developer.location}
          </div>
        </article>
      </div>
    </main>
  );
}
