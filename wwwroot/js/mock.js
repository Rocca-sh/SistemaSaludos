// ============================================================
//  mock.js — Datos simulados para desarrollo
//  CONFIG.USE_MOCK = true para usarlos
// ============================================================

const MOCK = {
  screens: [
    {
      id: "pantalla-lobby",
      location: "Planta Baja - Recepción",
      status: "online",
      activeMessage: {
        type: "saludoVisitante",
        payload: { nombre: "Israel García Juarez", cargo: "Director General", empresa: "Heidelberg" },
        sentAt: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      queue: [
        {
          id: "q1",
          visitId: 2,
          company: "Koenig & Bauer",
          type: "saludoVisitante",
          payload: { nombre: "Klaus Weber", cargo: "VP Sales Europe", empresa: "Koenig & Bauer" },
        }
      ],
    },
    {
      id: "pantalla-sala1",
      location: "Piso 1 - Showroom A",
      status: "online",
      activeMessage: null,
      queue: [],
    },
    {
      id: "pantalla-sala2",
      location: "Piso 1 - Showroom B",
      status: "offline",
      activeMessage: {
        type: "saludoGrupo",
        payload: { empresa: "Canon Industrial" },
        sentAt: new Date(Date.now() - 20 * 60000).toISOString(),
      },
      queue: [
        {
          id: "q2",
          visitId: 3,
          company: "Canon Industrial",
          type: "saludoGrupo",
          payload: { empresa: "Canon Industrial", visitantes: [{ nombre: "Yuki Tanaka", cargo: "Product Manager" }] },
        }
      ],
      pendingReconnect: true,
    },
    {
      id: "pantalla-sala3",
      location: "Piso 2 - Sala de Juntas",
      status: "online",
      activeMessage: null,
      queue: [],
    },
    {
      id: "pantalla-entrada",
      location: "Entrada Principal",
      status: "offline",
      activeMessage: null,
      queue: [],
      pendingReconnect: false,
    },
  ],

  visits: [
    {
      id: 1,
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      durationMinutes: 60,
      company: "Heidelberg",
      logo: null,
      host: "David Hernández",
      area: "Planta - Showroom A",
      source: "ideeo",
      visitors: [
        { name: "Israel García Juarez", role: "Director General" },
        { name: "Mauro Ruvalcaba",      role: "Director Comercial" },
      ],
    },
    {
      id: 2,
      date: new Date().toISOString().split("T")[0],
      time: (() => {
        const d = new Date(Date.now() + 13 * 60000);
        return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
      })(),
      durationMinutes: 90,
      company: "Koenig & Bauer",
      logo: null,
      host: "Ana Pérez",
      area: "Piso 2 - Sala de Juntas",
      source: "ideeo",
      visitors: [
        { name: "Klaus Weber", role: "VP Sales Europe" },
      ],
    },
    {
      id: 3,
      date: new Date().toISOString().split("T")[0],
      time: "14:00",
      durationMinutes: 120,
      company: "Canon Industrial",
      logo: null,
      host: "Luis Torres",
      area: "Piso 1 - Showroom B",
      source: "manual",
      visitors: [
        { name: "Yuki Tanaka",   role: "Product Manager"  },
        { name: "Carlos Mendoza", role: "Sales Engineer"  },
        { name: "Sofía Reyes",   role: "Account Manager" },
      ],
    },
    {
      id: 4,
      date: (() => { const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().split("T")[0]; })(),
      time: "10:00",
      durationMinutes: 60,
      company: "Xerox Solutions",
      logo: null,
      host: "David Hernández",
      area: "Piso 1 - Showroom A",
      source: "ideeo",
      visitors: [
        { name: "Robert Chang", role: "Regional Director" },
      ],
    },
  ],
};
