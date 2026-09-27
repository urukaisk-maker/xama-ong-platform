import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong, developer, legal } = SITE_CONFIG;

export default function CookiesPage() {
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
            Política de cookies
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: {legal.lastUpdated}
          </p>

          <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
            <h2>1. ¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu
              dispositivo al visitar un sitio web. Sirven para recordar
              información sobre tu visita, como tus preferencias de idioma,
              sesión iniciada o si ya has interactuado con ciertos contenidos.
            </p>

            <h2>2. Cookies que utiliza {ong.name}</h2>
            <p>
              Esta Plataforma es minimalista en el uso de cookies. Solo
              utilizamos las siguientes:
            </p>

            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Finalidad</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>xama_token</code>
                  </td>
                  <td>Técnica (localStorage)</td>
                  <td>
                    Almacenar el token JWT de sesión para mantener la sesión
                    iniciada del usuario autenticado.
                  </td>
                  <td>Mientras dura la sesión</td>
                </tr>
                <tr>
                  <td>
                    <code>xama_theme</code>
                  </td>
                  <td>Técnica (localStorage)</td>
                  <td>
                    Recordar tu preferencia de tema (claro/oscuro) para no
                    volver a preguntarte cada vez.
                  </td>
                  <td>Permanente hasta borrado manual</td>
                </tr>
              </tbody>
            </table>

            <h2>3. Cookies de terceros</h2>
            <p>
              No utilizamos cookies de terceros, ni de analítica (Google
              Analytics, etc.), ni de publicidad, ni de redes sociales. No
              hacemos seguimiento de tu navegación fuera de esta Plataforma.
            </p>

            <h2>4. Consentimiento</h2>
            <p>
              Al utilizar esta Plataforma aceptas el uso de las cookies técnicas
              descritas. Dado que son estrictamente necesarias para su
              funcionamiento (login y preferencias), no requieren
              consentimiento previo según el artículo 22.2 de la LSSI.
            </p>

            <h2>5. Cómo eliminar las cookies</h2>
            <p>
              Puedes borrar el almacenamiento local de este sitio desde la
              configuración de tu navegador. Ten en cuenta que si borras{" "}
              <code>xama_token</code>, se cerrará tu sesión; si borras{" "}
              <code>xama_theme</code>, volverás al tema claro por defecto.
            </p>
            <ul>
              <li>
                <b>Firefox:</b> Ajustes → Privacidad y seguridad → Cookies y
                datos del sitio
              </li>
              <li>
                <b>Chrome:</b> Configuración → Privacidad y seguridad → Cookies
                y otros datos de sitios
              </li>
              <li>
                <b>Safari:</b> Preferencias → Privacidad → Gestionar datos de
                sitios web
              </li>
              <li>
                <b>Edge:</b> Configuración → Cookies y permisos del sitio
              </li>
            </ul>

            <h2>6. Contacto</h2>
            <p>
              Si tienes dudas sobre esta política, puedes escribirnos a{" "}
              <a href={`mailto:${ong.email}`} className="text-emerald-600 underline dark:text-emerald-400">
                {ong.email}
              </a>.
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
