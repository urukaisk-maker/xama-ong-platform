"use client";
import { useState } from "react";

type ModalKey = "terminos" | "privacidad" | "cookies" | null;

export default function Footer() {
  const [modal, setModal] = useState<ModalKey>(null);

  return (
    <>
      <footer className="bg-black border-t border-cyan-400/20 text-cyan-300/70 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center text-sm">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <button onClick={() => setModal("terminos")} className="hover:text-cyan-200 transition">
              Términos de uso
            </button>
            <button onClick={() => setModal("privacidad")} className="hover:text-cyan-200 transition">
              Política de privacidad
            </button>
            <button onClick={() => setModal("cookies")} className="hover:text-cyan-200 transition">
              Política de cookies
            </button>
          </div>
          <div className="text-cyan-400/50 text-xs">
            Desarrollado por{" "}
            <a
              href="https://unique-biscochitos-31bcea.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4 transition"
            >
              Manuel Casimiro Carrasco
            </a>
          </div>
          <div className="text-cyan-400/40 text-xs">
            © {new Date().getFullYear()} XAMA · Sorteo de Cesta Solidaria
          </div>
        </div>
      </footer>

      {modal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-black border border-cyan-400/40 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-[0_0_60px_-10px_rgba(34,211,238,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-cyan-300">
                {modal === "terminos" && "Términos de uso"}
                {modal === "privacidad" && "Política de privacidad"}
                {modal === "cookies" && "Política de cookies"}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="text-cyan-400 hover:text-cyan-200 text-2xl leading-none shrink-0"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-cyan-100/80 leading-relaxed">
              {modal === "terminos" && (
                <>
                  <p>El presente sorteo solidario es organizado por la ONG XAMA sin ánimo de lucro.</p>
                  <p>La participación es totalmente gratuita. No se realiza ningún pago ni compra de boletos.</p>
                  <p>Cada participante puede obtener un único número entre el 1 y el 40.</p>
                  <p>El sorteo se realizará de forma pública y transparente entre los números asignados.</p>
                  <p>El ganador será contactado a través de los datos facilitados durante el registro.</p>
                  <p>XAMA se reserva el derecho de modificar o cancelar el sorteo por causas justificadas.</p>
                </>
              )}
              {modal === "privacidad" && (
                <>
                  <p>Los datos personales facilitados (nombre, teléfono y correo electrónico) se utilizan exclusivamente para gestionar el sorteo solidario.</p>
                  <p>No se cederán a terceros ni se usarán con fines comerciales.</p>
                  <p>El responsable del tratamiento es la ONG XAMA. Puedes ejercer tus derechos escribiendo al correo de contacto de la organización.</p>
                  <p>Los datos se conservarán únicamente durante el tiempo necesario para la celebración del sorteo y la entrega del premio.</p>
                </>
              )}
              {modal === "cookies" && (
                <>
                  <p>Este sitio utiliza únicamente cookies técnicas necesarias para su correcto funcionamiento.</p>
                  <p>No se emplean cookies de seguimiento, publicidad ni análisis de terceros.</p>
                  <p>Al navegar por este sitio aceptas el uso de estas cookies esenciales.</p>
                </>
              )}
            </div>

            <button
              onClick={() => setModal(null)}
              className="mt-8 w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-100 font-bold hover:bg-cyan-500/20 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
