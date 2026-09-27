export const SITE_CONFIG = {
  // ─── ONG ───
  ong: {
  bizumPhone: "600 000 000",              // ← teléfono Bizum real
  iban: "ES00 0000 0000 0000 0000 0000",  // ← IBAN real
  ibanHolder: "XAMA ONG",                  // ← titular de la cuenta
  email: "hola@xamaong.cat",               // ← email real de contacto
  phone: "977 000 000",                    // ← teléfono fijo
  address: "Reus · Tarragona (España)",    // ← dirección de la sede
  // ...
},

developer: {
  name: "Manuel Casimiro Carrasco",
  role: "Desarrollador Web",
  location: "Reus, Tarragona (España)",
  email: "manuelcasimirocarrasco@example.com",  // ← tu email real
  // ...
}

  // ─── Desarrollador ───
  developer: {
    name: "Manuel Casimiro Carrasco",
    role: "Desarrollador Web",
    location: "Reus, Tarragona (España)",
    email: "manuelcasimirocarrasco@example.com", // ← CAMBIA por tu email real
    bio: "Desarrollador web con experiencia en el campo de la tecnología. Nuestra visión es tu visión: imaginamos las visiones que tú estás imaginando y hacemos que se conviertan en realidad, bien hechas.",
    longBio:
      "Esa pasión lo llevó a estudiar una carrera relacionada con el desarrollo web. Durante sus años de formación, Manuel se destacó por su dedicación y su habilidad para resolver problemas de manera creativa. Aprovechó cada oportunidad para ampliar sus conocimientos, participando en proyectos y obteniendo varias certificaciones que complementaron su educación. Manuel es una persona con una amplia gama de intereses. Disfruta de la lectura, la música y los deportes, y también se mantiene actualizado sobre las últimas tendencias y avances en el campo de la tecnología. Habla con fluidez español, su lengua materna, y también domina el inglés a un nivel avanzado, lo que le ha permitido colaborar con equipos internacionales.",
    projects: [
      {
        label: "Proyecto 1",
        url: "https://rad-dolphin-182dfb.netlify.app/",
      },
      {
        label: "Proyecto 2",
        url: "https://unique-biscochitos-31bcea.netlify.app/",
      },
    ],
  },

  // ─── Legal ───
  legal: {
    lastUpdated: "27 de septiembre de 2026",
    jurisdiction: "España",
    contactEmail: "hola@xamaong.cat",
  },
} as const;
