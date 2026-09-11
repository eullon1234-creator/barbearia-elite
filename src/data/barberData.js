const getRelativeDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Dados Oficiais da Barbearia Elite (Edivan & Valdivan)
export const BARBERSHOP_DATA = {
  name: "Barbearia Elite",
  tagline: "Estilo, elegância e precisão na Av. Petrônio Portela",
  owner: "Edivan & Valdivan",
  phone: "(86) 99472-7396",
  whatsappNumber: "5586994727396",
  instagram: "edyvan_cortes_106",
  instagramSecondary: "barbearia_elite001",
  instagramUrl: "https://instagram.com/edyvan_cortes_106",
  address: "Avenida Petrônio Portela",
  cityState: "Avenida Petrônio Portela",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avenida+Petronio+Portela",
  rating: 4.9,
  reviewsCount: 128,
  experienceYears: "5+ anos",
  
  // Barbeiros da Equipe (Edivan e Valdivan)
  barbers: [
    {
      id: 'edivan',
      name: 'Edivan',
      role: 'Barbeiro Profissional',
      specialties: ['Degradê', 'Barba na Toalha Quente', 'Tesoura', 'Platinado', 'Freestyle'],
      instagram: 'edyvan_cortes_106',
    },
    {
      id: 'valdivan',
      name: 'Valdivan',
      role: 'Barbeiro Profissional',
      specialties: ['Degradê', 'Barba na Toalha Quente', 'Tesoura', 'Acabamento', 'Freestyle'],
      instagram: 'edyvan_cortes_106',
    }
  ],

  // Imagens de demonstração de alta qualidade
  images: {
    hero: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
    barber: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80",
    logoBadge: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80",
  },

  // Horários de Atendimento oficiais (8:00 às 12:00 e 14:00 às 18:00)
  schedule: {
    weekdays: "Segunda a Sexta: 08:00 às 12:00 e 14:00 às 18:00",
    saturday: "Sábado: 08:00 às 12:00 e 14:00 às 18:00",
    sunday: "Domingo: Fechado",
  },

  // Comodidades
  amenities: [
    { id: 'ac', label: 'Ambiente Climatizado', icon: 'Snowflake' },
    { id: 'wifi', label: 'Wi-Fi de Alta Velocidade', icon: 'Wifi' },
    { id: 'coffee', label: 'Café & Bebidas', icon: 'Coffee' },
    { id: 'music', label: 'Música Ambiente', icon: 'Music' },
    { id: 'parking', label: 'Fácil Acesso', icon: 'Car' },
  ],

  // Serviços Adicionais (Upsell no Agendamento)
  extras: [
    { id: 'extra-sobrancelha', name: 'Sobrancelha na Navalha', price: 10.00, durationMinutes: 10, icon: '✂️', description: 'Design e alinhamento na lâmina' },
    { id: 'extra-toalha-quente', name: 'Terapia de Toalha Quente / Ozônio', price: 15.00, durationMinutes: 15, icon: '🧖‍♂️', description: 'Abertura de poros e relaxamento' },
    { id: 'extra-lavagem', name: 'Lavagem Especial + Pomada', price: 10.00, durationMinutes: 10, icon: '🧼', description: 'Shampoo refrescante e finalização' },
    { id: 'extra-barba', name: 'Alinhamento de Barba Rápido', price: 15.00, durationMinutes: 15, icon: '🧔', description: 'Desenho rápido da linha da barba' },
    { id: 'extra-pigmentacao', name: 'Pigmentação / Disfarce Extra', price: 15.00, durationMinutes: 15, icon: '🎨', description: 'Realce e camuflagem de falhas' },
  ],

  // Catálogo de Serviços com Valores e Imagens
  services: [
    {
      id: 'combo-elite',
      name: 'Combo Elite (Corte + Barba)',
      category: 'combo',
      duration: '45 min',
      price: 30.00,
      description: 'A experiência completa: corte degradê de alta definição + barboterapia com produtos premium.',
      image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
      popular: true,
      badge: 'Mais Pedido',
    },
    {
      id: 'corte-masculino',
      name: 'Corte Masculino (Degradê / Clássico)',
      category: 'cabelo',
      duration: '30 min',
      price: 20.00,
      description: 'Degradê na navalha ou máquina, fade limpo, corte social clássico ou moderno com finalização impecável.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
      popular: true,
    },
    {
      id: 'barba-completa',
      name: 'Barba Completa / Terapia',
      category: 'barba',
      duration: '25 min',
      price: 15.00,
      description: 'Design e alinhamento de barba com terapia de toalha quente, hidratação profunda e lâmina descartável.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      popular: false,
    },
    {
      id: 'sobrancelha',
      name: 'Sobrancelha / Acabamento',
      category: 'acabamento',
      duration: '15 min',
      price: 10.00,
      description: 'Alinhamento na navalha ou pinça para harmonizar o olhar e dar acabamento limpo ao visual.',
      image: 'https://images.unsplash.com/photo-1517832606589-7629c6ae9e44?auto=format&fit=crop&w=600&q=80',
      popular: false,
    },
    {
      id: 'platinado-luzes',
      name: 'Platinado / Luzes / Pigmentação',
      category: 'quimica',
      duration: '60 min',
      price: 60.00,
      description: 'Descoloração profissional com matização e pigmentação especial sem agredir os fios.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
      popular: false,
    }
  ],

  // Agendamentos simulados para a demonstração da Área do Barbeiro e Métricas
  mockBarberAppointments: [
    // Atendimentos de Hoje
    {
      id: 'apt-1',
      client: 'Marcos Vinícius',
      phone: '(99) 98144-1234',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(0),
      time: '13:30',
      price: 50.00,
      payment: 'Pix',
      status: 'Concluído',
    },
    {
      id: 'apt-2',
      client: 'Lucas Ribeiro',
      phone: '(99) 98210-9988',
      service: 'Corte Masculino / Degradê',
      date: getRelativeDateStr(0),
      time: '14:30',
      price: 30.00,
      payment: 'Cartão',
      status: 'Em Atendimento',
    },
    {
      id: 'apt-3',
      client: 'Gabriel Souza',
      phone: '(99) 99105-4321',
      service: 'Barba Alinhada / Toalha Quente',
      date: getRelativeDateStr(0),
      time: '15:30',
      price: 25.00,
      payment: 'Dinheiro',
      status: 'Confirmado',
    },
    {
      id: 'apt-4',
      client: 'Rodrigo Lima',
      phone: '(99) 98455-7711',
      service: 'Corte Masculino / Degradê',
      date: getRelativeDateStr(0),
      time: '16:30',
      price: 30.00,
      payment: 'Pix',
      status: 'Confirmado',
    },
    // Atendimentos Passados do Mês (Histórico Concluído)
    {
      id: 'apt-5',
      client: 'Felipe Santos',
      phone: '(99) 98112-4455',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(-1),
      time: '14:00',
      price: 50.00,
      payment: 'Pix',
      status: 'Concluído',
    },
    {
      id: 'apt-6',
      client: 'André Martins',
      phone: '(99) 99221-7788',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(-1),
      time: '15:00',
      price: 50.00,
      payment: 'Pix',
      status: 'Concluído',
    },
    {
      id: 'apt-7',
      client: 'Mateus Oliveira',
      phone: '(99) 98833-2211',
      service: 'Corte Masculino / Degradê',
      date: getRelativeDateStr(-1),
      time: '16:00',
      price: 30.00,
      payment: 'Dinheiro',
      status: 'Concluído',
    },
    {
      id: 'apt-8',
      client: 'Eduardo Costa',
      phone: '(99) 99144-9900',
      service: 'Platinado / Luzes / Nevou',
      date: getRelativeDateStr(-2),
      time: '14:00',
      price: 80.00,
      payment: 'Cartão',
      status: 'Concluído',
    },
    {
      id: 'apt-9',
      client: 'Rafael Barbosa',
      phone: '(99) 98199-6633',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(-2),
      time: '16:00',
      price: 50.00,
      payment: 'Pix',
      status: 'Concluído',
    },
    {
      id: 'apt-10',
      client: 'Gustavo Henrique',
      phone: '(99) 99200-3344',
      service: 'Corte Masculino / Degradê',
      date: getRelativeDateStr(-3),
      time: '13:30',
      price: 30.00,
      payment: 'Pix',
      status: 'Concluído',
    },
    {
      id: 'apt-11',
      client: 'Thiago Nogueira',
      phone: '(99) 98155-2244',
      service: 'Barba Alinhada / Toalha Quente',
      date: getRelativeDateStr(-3),
      time: '15:00',
      price: 25.00,
      payment: 'Dinheiro',
      status: 'Concluído',
    },
    {
      id: 'apt-12',
      client: 'Bruno Castro',
      phone: '(99) 99177-8899',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(-3),
      time: '16:30',
      price: 50.00,
      payment: 'Pix',
      status: 'Concluído',
    },
    // Agendamentos Futuros (Previsão de Faturamento)
    {
      id: 'apt-13',
      client: 'Vinícius Rocha',
      phone: '(99) 98233-1122',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(1),
      time: '09:00',
      price: 50.00,
      payment: 'Pix',
      status: 'Confirmado',
    },
    {
      id: 'apt-14',
      client: 'Diego Alencar',
      phone: '(99) 98122-3377',
      service: 'Corte Masculino / Degradê',
      date: getRelativeDateStr(1),
      time: '10:00',
      price: 30.00,
      payment: 'Cartão',
      status: 'Confirmado',
    },
    {
      id: 'apt-15',
      client: 'Leonardo Ferreira',
      phone: '(99) 99244-5566',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(1),
      time: '11:00',
      price: 50.00,
      payment: 'Pix',
      status: 'Confirmado',
    },
    {
      id: 'apt-16',
      client: 'Samuel Dias',
      phone: '(99) 98877-6655',
      service: 'Corte Masculino / Degradê',
      date: getRelativeDateStr(2),
      time: '14:00',
      price: 30.00,
      payment: 'Dinheiro',
      status: 'Confirmado',
    },
    {
      id: 'apt-17',
      client: 'Henrique Prado',
      phone: '(99) 99111-4477',
      service: 'Combo Elite (Corte + Barba)',
      date: getRelativeDateStr(2),
      time: '15:30',
      price: 50.00,
      payment: 'Pix',
      status: 'Confirmado',
    },
    {
      id: 'apt-18',
      client: 'Caio Medeiros',
      phone: '(99) 98166-5544',
      service: 'Barba Alinhada / Toalha Quente',
      date: getRelativeDateStr(2),
      time: '17:00',
      price: 25.00,
      payment: 'Pix',
      status: 'Confirmado',
    }
  ]
};

// Gerador de Slots de Horários com base no dia da semana (08:00 às 12:00 e 14:00 às 18:00)
export function getAvailableTimeSlots(dateString) {
  if (!dateString) return [];
  
  // Date format: YYYY-MM-DD
  const parts = dateString.split('-');
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  // Domingo fechado
  if (dayOfWeek === 0) {
    return [];
  }

  // Segunda a Sábado: Manhã (08:00 às 12:00) e Tarde (14:00 às 18:00)
  return [
    // Manhã
    { time: '08:00', available: true },
    { time: '08:30', available: true },
    { time: '09:00', available: false }, // Simulado como ocupado para realismo
    { time: '09:30', available: true },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    // Tarde
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: false }, // Simulado como ocupado
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
  ];
}
