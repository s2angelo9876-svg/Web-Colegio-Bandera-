/**
 * Configuracion declarativa de tours de ayuda.
 *
 * Convencion data-tour: "<tourId>-<stepId>"
 *
 * Cada paso:
 *   id:        identificador unico (usado como data-tour="<id>")
 *   target:    selector CSS (sin prefijo data-tour=)
 *   title:     titulo del paso
 *   content:   explicacion en lenguaje sencillo
 *   placement: 'top' | 'bottom' | 'left' | 'right' (donde aparece la tarjeta)
 *   nextLabel: texto del boton siguiente (default: 'Siguiente')
 *   skip:      si es false, oculta el boton "Saltar tour"
 */

export const TOUR_DASHBOARD_GENERAL = {
  id: 'dashboard-general',
  title: 'Conoce el Panel de Control',
  description: 'Recorrido rapido por las partes principales',
  steps: [
    {
      id: 'bienvenida',
      target: '[data-tour="dashboard-bienvenida"]',
      title: '¡Bienvenido al panel!',
      content: 'Aqui tienes una vista rapida de todo lo que pasa en tu web. Te mostraremos como aprovechar cada seccion.',
      placement: 'bottom',
    },
    {
      id: 'alertas',
      target: '[data-tour="dashboard-alertas"]',
      title: 'Notificaciones importantes',
      content: 'Si tienes tramites pendientes o admisiones recientes, apareceran aqui arriba con un color llamativo.',
      placement: 'bottom',
    },
    {
      id: 'acciones',
      target: '[data-tour="dashboard-acciones"]',
      title: '¿Que quieres hacer hoy?',
      content: 'Estos cuatro botones grandes son las tareas mas comunes. Click en cualquiera para empezar.',
      placement: 'top',
    },
    {
      id: 'estadisticas',
      target: '[data-tour="dashboard-stats"]',
      title: 'Tu web en numeros',
      content: 'Aqui ves cuantos elementos tienes en cada modulo. Click en cualquiera para ir directamente.',
      placement: 'top',
    },
    {
      id: 'menu',
      target: '[data-tour="dashboard-sidebar"]',
      title: 'Menu de navegacion',
      content: 'A la izquierda tienes todos los modulos. Los items que ves son los que puedes gestionar segun tu rol.',
      placement: 'right',
    },
  ],
};

export const TOUR_NOTICIAS = {
  id: 'noticias',
  title: 'Como crear una noticia',
  description: 'Publicar contenido en 1 minuto',
  steps: [
    {
      id: 'boton-nueva',
      target: '[data-tour="noticias-boton-nueva"]',
      title: 'Boton "Nueva Noticia"',
      content: 'Empieza siempre aqui. El sistema te guiara paso a paso.',
      placement: 'bottom',
    },
    {
      id: 'titulo',
      target: '[data-tour="noticias-titulo"]',
      title: 'El titular',
      content: 'Escribe un titular claro. Los padres lo veran primero en la portada. Maximo 100 letras.',
      placement: 'bottom',
    },
    {
      id: 'cuerpo',
      target: '[data-tour="noticias-cuerpo"]',
      title: 'El cuerpo',
      content: 'Cuenta los detalles con orden. Puedes usar parrafos.',
      placement: 'top',
    },
    {
      id: 'imagen',
      target: '[data-tour="noticias-imagen"]',
      title: 'Imagen de portada',
      content: 'Una imagen vale mas que mil palabras. Sube una foto horizontal (1200x600 px recomendado).',
      placement: 'left',
    },
    {
      id: 'revisar',
      target: '[data-tour="noticias-revisar"]',
      title: 'Revisar antes de publicar',
      content: 'El ultimo paso del wizard te muestra un resumen. Si todo esta bien, pulsa "Publicar".',
      placement: 'top',
    },
  ],
};

export const TOUR_MESA_PARTES = {
  id: 'mesa-partes',
  title: 'Mesa de Partes Virtual',
  description: 'Como gestionar tramites de ciudadanos',
  steps: [
    {
      id: 'lista',
      target: '[data-tour="mesa-lista"]',
      title: 'Lista de tramites',
      content: 'Aqui ves todos los tramites que enviaron los ciudadanos. Los pendientes aparecen marcados.',
      placement: 'top',
    },
    {
      id: 'cambiar-estado',
      target: '[data-tour="mesa-estado"]',
      title: 'Cambiar estado',
      content: 'Click en el estado actual (ej. "Pendiente") para cambiarlo. El ciudadano recibira un email automatico.',
      placement: 'left',
    },
    {
      id: 'buscar',
      target: '[data-tour="mesa-buscar"]',
      title: 'Buscar tramites',
      content: 'Escribe el codigo (ej. EXP-2026-12345) o el nombre del ciudadano para encontrar rapido.',
      placement: 'bottom',
    },
    {
      id: 'eliminar',
      target: '[data-tour="mesa-eliminar"]',
      title: 'Eliminar tramite',
      content: 'Solo elimines tramites en casos extremos. La accion es irreversible.',
      placement: 'left',
    },
  ],
};

export const ALL_TOURS = [
  TOUR_DASHBOARD_GENERAL,
  TOUR_NOTICIAS,
  TOUR_MESA_PARTES,
];

export const FAQ_ITEMS = [
  {
    q: '¿Como programo una noticia para que salga en una fecha futura?',
    a: 'Al crear o editar una noticia, en el ultimo paso del wizard elige "Programar para" y selecciona la fecha y hora.',
  },
  {
    q: '¿Que tamano o formato deben tener las fotos?',
    a: 'Para la portada de noticias: 1200x600 pixeles, formato JPG o WebP. Para la galeria: 1600x1200 maximo.',
  },
  {
    q: '¿Como reordeno los docentes o fotos de la galeria?',
    a: 'En el modulo correspondiente, arrastra el item a la posicion que quieras. Los cambios se guardan automaticamente.',
  },
  {
    q: '¿Donde veo quien hizo un cambio en el sistema?',
    a: 'En el menu lateral ve a "Mi Cuenta" > "Actividad". Ahi veras todas las acciones con fecha, usuario y que cambio.',
  },
  {
    q: '¿Como cambio mi contrasena?',
    a: 'Ve al menu lateral > "Mi Cuenta" > "Cambiar contrasena". Necesitas tu contrasena actual para cambiarla.',
  },
  {
    q: '¿Puedo crear mas usuarios administradores?',
    a: 'Si, pero solo desde "Usuarios" en el menu lateral (solo visible para administradores). Puedes asignar rol "admin" o "editor".',
  },
  {
    q: '¿Que puede hacer un "editor" que no puede un "user"?',
    a: 'Un editor puede crear y editar contenido (noticias, eventos, etc.) pero no puede eliminarlo ni gestionar usuarios.',
  },
  {
    q: '¿Que pasa si me equivoco al borrar algo?',
    a: 'La mayoria de borrados son IRREVERSIBLES. Te pediremos confirmacion antes. Si es algo critico, contacta al administrador tecnico.',
  },
  {
    q: '¿Como contacto al soporte tecnico?',
    a: 'En el boton "?" del header, abre el Centro de Ayuda y busca la pestana "Contacto". Ahi veras los datos del equipo de innovacion.',
  },
  {
    q: '¿Puedo trabajar desde el celular?',
    a: 'Si, el panel es responsive. Pero para tareas largas (subir muchas fotos, redactar) recomendamos usar una pantalla grande.',
  },
];

export const SUPPORT_CONTACT = {
  titulo: 'Equipo de Innovacion Tecnologica',
  responsable: 'Coordinacion de Innovacion del Colegio Bandera del Peru',
  email: 'informatica@banderadelperu.edu.pe',
  telefono: '(056) 123-456',
  horario: 'Lunes a Viernes, 8:00 AM - 3:00 PM',
  nota: 'Para incidentes urgentes fuera del horario escolar, enviar email con copia al director.',
};
