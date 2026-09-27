import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong, developer, legal } = SITE_CONFIG;

export default function PrivacyPage() {
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
            Política de privacidad
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Última actualización: {legal.lastUpdated}
          </p>

          <div className="prose prose-slate mt-8 max-w-none dark:prose-invert">
            <h2>1. Responsable del tratamiento</h2>
            <p>
              El responsable del tratamiento de los datos personales recogidos
              en esta Plataforma es <b>{ong.fullName}</b>, con domicilio en{" "}
              {ong.address}. Correo de contacto:{" "}
              <a href={`mailto:${ong.email}`} className="text-emerald-600 underline dark:text-emerald-400">
                {ong.email}
              </a>.
            </p>

            <h2>2. Finalidad del tratamiento</h2>
            <p>Los datos personales se tratan con las siguientes finalidades:</p>
            <ul>
              <li>
                <b>Gestión de voluntariado:</b> organizar turnos, asignar roles
                y llevar un registro de las horas aportadas.
              </li>
              <li>
                <b>Gestión de beneficiarios:</b> identificar a las familias
                atendidas, sus necesidades alimentarias y el reparto de cestas.
              </li>
              <li>
                <b>Emisión de certificados:</b> generar certificados de
                voluntariado y de donación fiscalmente válidos.
              </li>
              <li>
                <b>Comunicaciones:</b> enviar avisos internos, alertas de
                caducidades y notificaciones operativas.
              </li>
            </ul>

            <h2>3. Base legal</h2>
            <p>
              El tratamiento se basa en el <b>consentimiento expreso</b> del
              interesado y en el <b>interés legítimo</b> de la entidad para
              cumplir con su misión social, según lo previsto en el
              Reglamento (UE) 2016/679 (RGPD) y en la Ley Orgánica 3/2018
              (LOPDGDD).
            </p>

            <h2>4. Categorías de datos</h2>
            <p>Se tratan las siguientes categorías de datos:</p>
            <ul>
              <li>Datos identificativos: nombre, DNI/NIE, email, teléfono.</li>
              <li>Datos de contacto: dirección postal.</li>
              <li>
                Datos de salud (categoría especial): <b>alergias y
                restricciones alimentarias</b> de los beneficiarios.
              </li>
              <li>Datos de actividad: turnos, horas, entregas recibidas.</li>
            </ul>
            <p>
              Los datos de salud se tratan con especial confidencialidad y solo
              con la finalidad de garantizar la seguridad alimentaria de los
              beneficiarios.
            </p>

            <h2>5. Conservación</h2>
            <p>
              Los datos se conservarán mientras se mantenga la relación con la
              entidad y, posteriormente, durante los plazos legalmente
              exigidos para atender responsabilidades administrativas, fiscales
              o judiciales.
            </p>

            <h2>6. Destinatarios</h2>
            <p>
              No se cederán datos a terceros salvo obligación legal. Los datos
              podrán ser tratados por proveedores tecnológicos que actúan como
              encargados del tratamiento (hosting, backup, email), siempre con
              contratos que garantizan el cumplimiento del RGPD.
            </p>

            <h2>7. Derechos del interesado</h2>
            <p>
              Puedes ejercer los siguientes derechos escribiendo a{" "}
              <a href={`mailto:${ong.email}`} className="text-emerald-600 underline dark:text-emerald-400">
                {ong.email}
              </a>:
            </p>
            <ul>
              <li>Acceso a tus datos personales.</li>
              <li>Rectificación de datos inexactos.</li>
              <li>Supresión (derecho al olvido).</li>
              <li>Limitación u oposición al tratamiento.</li>
              <li>Portabilidad de los datos.</li>
              <li>Retirar el consentimiento en cualquier momento.</li>
            </ul>
            <p>
              También puedes reclamar ante la Agencia Española de Protección de
              Datos (<a href="https://www.aepd.es" target="_blank" rel="noreferrer" className="text-emerald-600 underline dark:text-emerald-400">www.aepd.es</a>).
            </p>

            <h2>8. Seguridad</h2>
            <p>
              La Plataforma aplica medidas técnicas y organizativas apropiadas
              para garantizar la seguridad de los datos personales y evitar su
              alteración, pérdida, tratamiento o acceso no autorizado.
            </p>

            <h2>9. Cambios en la política</h2>
            <p>
              Esta política puede actualizarse para adaptarse a novedades
              legislativas o cambios en los servicios. Recomendamos revisarla
              periódicamente.
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
