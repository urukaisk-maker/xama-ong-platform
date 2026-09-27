export const SITE_CONFIG = {
  ong: {
    name: "XAMA-ONG",
    fullName: "XAMA-ONG · Asociación sin ánimo de lucro",
    tagline: "Recuperamos alimentos, alimentamos esperanza",
    bizumPhone: "600 000 000",
    iban: "ES00 0000 0000 0000 0000 0000",
    ibanHolder: "XAMA ONG",
    email: "hola@xamaong.cat",
    phone: "977 000 000",
    address: "Reus · Tarragona (España)",
    city: "Reus",
    bankName: "CaixaBank",
    instagram: "",
    facebook: "",
    twitter: "",
  },

  developer: {
    name: "Manuel Casimiro Carrasco",
    role: "Desarrollador Web",
    location: "Reus, Tarragona (España)",
    email: "manuelcasimirocarrasco@example.com",
    bio: "Desarrollador web con experiencia en el campo de la tecnología. Nuestra visión es tu visión: imaginamos las visiones que tú estás imaginando y hacemos que se conviertan en realidad, y lo hacemos bien.",
    longBio:
      "Esa pasión lo llevó a estudiar una carrera relacionada con el desarrollo web. Durante sus años de formación, Manuel se destacó por su dedicación y su habilidad para resolver problemas de manera creativa. Aprovechó cada oportunidad para ampliar sus conocimientos, participando en proyectos y obteniendo varias certificaciones que complementaron su educación. Manuel es una persona con una amplia gama de intereses. Disfruta de la lectura, la música y los deportes, y también se mantiene actualizado sobre las últimas tendencias y avances en el campo de la tecnología. Habla con fluidez español, su lengua materna, y también domina el inglés a un nivel avanzado, lo que le ha permitido colaborar con equipos internacionales.",
    presentationUrl: "https://silly-boba-dc057e.netlify.app/",
    projects: [
      { label: "Proyecto 1", url: "https://rad-dolphin-182dfb.netlify.app/" },
      { label: "Proyecto 2", url: "https://unique-biscochitos-31bcea.netlify.app/" },
    ],
  },

  legal: {
    lastUpdated: "27 de septiembre de 2026",
    jurisdiction: "España",
    contactEmail: "hola@xamaong.cat",
  },

  // ─── Testimonios (edita aquí cuando tengas los reales) ───
  testimonials: [
    {
      quote:
        "Empecé hace dos años y ya no puedo parar. Ver la cara de las familias cuando reciben su cesta no tiene precio. Es la hora mejor invertida de mi semana.",
      author: "María",
      role: "Voluntaria · Reus",
    },
    {
      quote:
        "Llegamos al país sin nada. XAMA nos ayudó cuando más lo necesitábamos, sin hacernos sentir mal. Hoy ya no lo necesitamos y ahora somos nosotros los que colaboramos.",
      author: "Anónimo",
      role: "Familia beneficiaria · Tarragona",
    },
    {
      quote:
        "Colaboramos desde 2024. Es una forma tangible de evitar el desperdicio de nuestro excedente diario y saber que va directo a quien lo necesita.",
      author: "Panificadora del Baix Camp",
      role: "Empresa donante",
    },
  ],

  // ─── Cómo lo hacemos (4 pasos/pilares) ───
  pillars: [
    {
      icon: "Apple",
      title: "Recuperamos",
      desc: "Excedentes de comercios locales, agricultores, empresas y campañas solidarias. Nada se tira si se puede aprovechar.",
    },
    {
      icon: "HandHeart",
      title: "Repartimos",
      desc: "Preparamos cestas semanales y las hacemos llegar a las familias de Reus y Tarragona que más lo necesitan.",
    },
    {
      icon: "Leaf",
      title: "Cuidamos",
      desc: "Reducimos el desperdicio alimentario y medimos el CO₂ evitado. Cuidamos el planeta y a las personas.",
    },
    {
      icon: "BarChart3",
      title: "Transparencia",
      desc: "Publicamos cifras en tiempo real: kg recuperados, familias atendidas, raciones servidas. Sin letra pequeña.",
    },
  ],

  // ─── Beneficios para empresas ───
  companyBenefits: [
    "Recogida semanal programada de vuestro excedente",
    "Certificado de impacto ambiental (CO₂ evitado) para vuestra memoria ESG",
    "Certificado de donación deducible fiscalmente (Ley 49/2002)",
    "Mención como empresa colaboradora en nuestras memorias anuales",
    "Sin coste: nosotros ponemos el transporte y los voluntarios",
  ],
} as const;
