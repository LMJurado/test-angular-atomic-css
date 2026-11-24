import {
  Directive,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';

interface Assignment {
  title: string;
  descriptionHtml: string;  // texto con HTML para mostrar instrucciones
  openDate: string;
  closeDate: string;
  deliveryType: 'text' | 'file' | 'mixed';
}

// Nombres de módulos
const MODULE_NAMES: { [id: string]: string } = {
  '1': 'Desarrollo Web',
  '2': 'Desarrollo Móvil',
  '3': 'DevOps'
};

// Nombres de temas por módulo/tema
const TOPIC_NAMES: { [modId: string]: { [topicId: string]: string } } = {
  '1': {
    '1': 'Fundamentos de HTML y CSS',
    '2': 'Fundamentos de JavaScript',
    '3': 'Angular Básico'
  },
  '2': {
    '1': 'Introducción al desarrollo de apps móviles',
    '2': 'Flutter Básico',
    '3': 'React Native Básico'
  },
  '3': {
    '1': 'Docker y contenedores',
    '2': 'CI/CD Pipeline',
    '3': 'Kubernetes Básico'
  }
};

// Todas las actividades (9), clave: `${modId}-${topicId}`
const ASSIGNMENTS: { [key: string]: Assignment } = {
  // ===== MÓDULO 1 – DESARROLLO WEB =====

  '1-1': {
    title: 'Actividad: Landing HTML + CSS básica',
    descriptionHtml: `
      <p>
        Crea una pequeña <strong>página de presentación personal</strong> usando solo HTML y CSS.
      </p>
      <ul>
        <li>Incluye un <strong>título principal</strong> (&lt;h1&gt;), al menos un &lt;h2&gt; y varios párrafos.</li>
        <li>Añade una <strong>lista</strong> (ordenada o desordenada) con tus habilidades.</li>
        <li>Aplica estilos básicos en un archivo <code>.css</code> (colores, tipografía, márgenes, etc.).</li>
        <li>Incluye al menos un <strong>enlace</strong> (&lt;a&gt;) a un sitio externo (por ejemplo, tu red social o una página que te guste).</li>
      </ul>
      <p>
        <strong>Entrega:</strong>
      </p>
      <ul>
        <li>Adjunta los archivos <code>.html</code> y <code>.css</code> como archivo(s) comprimido(s) (por ejemplo, <code>.zip</code>).</li>
        <li>En el cuadro de texto, escribe una breve explicación (5–8 líneas) sobre la estructura de tu página y qué decidiste estilizar con CSS.</li>
      </ul>
    `,
    openDate: '03 de diciembre de 2025, 00:00',
    closeDate: '05 de diciembre de 2025, 23:59',
    deliveryType: 'mixed'
  },

  '1-2': {
    title: 'Actividad: Mini página interactiva con JavaScript',
    descriptionHtml: `
      <p>
        Crea una página web sencilla que use <strong>JavaScript</strong> para añadir interacción al usuario.
      </p>
      <ul>
        <li>Incluye un campo de texto y un botón.</li>
        <li>Cuando el usuario haga clic en el botón, muestra un <strong>mensaje personalizado</strong> usando el valor del campo de texto.</li>
        <li>Manipula el DOM al menos en 2 aspectos (por ejemplo, cambiar el texto de un párrafo y el color de un elemento).</li>
        <li>Usa al menos una función en JavaScript y <code>addEventListener</code> o manejo de eventos en línea.</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Sube los archivos de tu proyecto (<code>.html</code>, <code>.js</code> y opcionalmente <code>.css</code>).</li>
        <li>En el cuadro de texto, describe brevemente (5–10 líneas) qué hace tu página y qué partes del DOM modificas.</li>
      </ul>
    `,
    openDate: '06 de diciembre de 2025, 00:00',
    closeDate: '08 de diciembre de 2025, 23:59',
    deliveryType: 'mixed'
  },

  '1-3': {
    title: 'Actividad: Componente Angular básico',
    descriptionHtml: `
      <p>
        Desarrolla un pequeño <strong>componente Angular</strong> que muestre una lista de elementos y permita añadir nuevos ítems desde un formulario.
      </p>
      <ul>
        <li>Crea un componente con un título, una lista (&lt;ul&gt; / &lt;li&gt;) y un formulario con un campo de texto y un botón.</li>
        <li>Cuando el usuario escriba un texto y haga clic en el botón, el ítem debe agregarse a la lista usando <strong>data binding</strong> y manejo de eventos.</li>
        <li>Utiliza <strong>propiedades del componente</strong> y <strong>ngFor</strong> para renderizar la lista.</li>
        <li>Añade estilos básicos al componente (puede ser CSS del propio componente o estilos globales).</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Sube los archivos del componente: <code>.ts</code>, <code>.html</code> y <code>.css</code> (o indica la ruta dentro de un proyecto comprimido).</li>
        <li>En el cuadro de texto, explica cómo manejas el estado de la lista (qué propiedad lo guarda y cómo se actualiza).</li>
      </ul>
    `,
    openDate: '09 de diciembre de 2025, 00:00',
    closeDate: '15 de diciembre de 2025, 23:59',
    deliveryType: 'mixed'
  },

  // ===== MÓDULO 2 – DESARROLLO MÓVIL =====

  '2-1': {
    title: 'Actividad: Análisis de app móvil (UX/UI)',
    descriptionHtml: `
      <p>
        Elige una <strong>aplicación móvil real</strong> que uses con frecuencia (por ejemplo, una red social, app bancaria, mensajería, etc.).
      </p>
      <p><strong>En tu análisis deberás:</strong></p>
      <ul>
        <li>Identificar si la app parece ser <strong>nativa, híbrida o web</strong> (justifica brevemente).</li>
        <li>Describir 3 aspectos positivos de la <strong>UI</strong> (interfaz), relacionados con claridad, legibilidad, iconografía, etc.</li>
        <li>Describir 3 aspectos positivos de la <strong>UX</strong> (experiencia), relacionados con flujo, navegación y facilidad de uso.</li>
        <li>Mencionar al menos 2 mejoras que propondrías para la app.</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Escribe tu análisis completo en el cuadro de texto (entre 400 y 600 palabras aproximadamente).</li>
        <li>Opcionalmente, puedes adjuntar capturas de pantalla de la app como archivo(s) adicional(es).</li>
      </ul>
    `,
    openDate: '16 de diciembre de 2025, 00:00',
    closeDate: '18 de diciembre de 2025, 23:59',
    deliveryType: 'mixed'
  },

  '2-2': {
    title: 'Actividad: Diseño de pantalla en Flutter',
    descriptionHtml: `
      <p>
        Diseña una pantalla sencilla en Flutter que represente el inicio de una app (por ejemplo, listado de tareas, notas o productos).
      </p>
      <ul>
        <li>Incluye un <strong>AppBar</strong> con título.</li>
        <li>En el cuerpo, usa una <strong>columna o lista</strong> para mostrar al menos 5 elementos.</li>
        <li>Aplica estilos básicos (colores, paddings, márgenes) usando widgets como <code>Container</code>, <code>Padding</code>, etc.</li>
        <li>Puedes hacerlo como boceto de código (no es necesario que compiles el proyecto, pero sí que el código sea coherente).</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Sube un archivo de texto o código (por ejemplo, <code>main.dart</code> o un fragmento) con tu implementación.</li>
        <li>Opcionalmente, puedes adjuntar una imagen/captura del diseño.</li>
        <li>Si lo prefieres, también puedes entregar un documento PDF donde expliques el código y muestres capturas.</li>
      </ul>
    `,
    openDate: '19 de diciembre de 2025, 00:00',
    closeDate: '25 de diciembre de 2025, 23:59',
    deliveryType: 'file'
  },

  '2-3': {
    title: 'Actividad: Lista simple con React Native',
    descriptionHtml: `
      <p>
        Diseña la estructura de un componente de React Native que muestre una lista de elementos usando <strong>FlatList</strong>.
      </p>
      <ul>
        <li>Define un arreglo de datos (por ejemplo, tareas, contactos o cursos).</li>
        <li>Crea un componente funcional que use <code>FlatList</code> para renderizar los ítems.</li>
        <li>En cada ítem, muestra al menos título y una descripción corta.</li>
        <li>Aplica estilos básicos usando <strong>StyleSheet</strong>.</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Sube un archivo con el código del componente (por ejemplo, <code>MyList.tsx</code> o similar) o un documento con el código bien formateado.</li>
        <li>En el cuadro de texto, puedes comentar brevemente qué representan los datos de tu lista.</li>
      </ul>
    `,
    openDate: '26 de diciembre de 2025, 00:00',
    closeDate: '01 de enero de 2026, 23:59',
    deliveryType: 'mixed'
  },

  // ===== MÓDULO 3 – DEVOPS =====

  '3-1': {
    title: 'Actividad: Dockerfile para una app web simple',
    descriptionHtml: `
      <p>
        Escribe un <strong>Dockerfile</strong> que empaquete una aplicación web sencilla (por ejemplo, una app estática con Nginx o una app Node.js simple).
      </p>
      <ul>
        <li>El Dockerfile debe partir de una imagen base adecuada (por ejemplo, <code>node</code> o <code>nginx</code>).</li>
        <li>Incluye los pasos para copiar el código de la app al contenedor.</li>
        <li>Añade los comandos necesarios para instalar dependencias (si aplica) y exponer el puerto.</li>
        <li>Incluye el comando <code>CMD</code> o <code>ENTRYPOINT</code> correspondiente para ejecutar la app.</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Sube tu archivo <code>Dockerfile</code> (o un archivo de texto con su contenido).</li>
        <li>En el cuadro de texto, explica en 5–8 líneas qué hace cada sección del Dockerfile (FROM, COPY, RUN, EXPOSE, CMD...).</li>
      </ul>
    `,
    openDate: '02 de enero de 2026, 00:00',
    closeDate: '04 de enero de 2026, 23:59',
    deliveryType: 'mixed'
  },

  '3-2': {
    title: 'Actividad: Diseño de un pipeline CI/CD',
    descriptionHtml: `
      <p>
        Diseña un <strong>pipeline CI/CD</strong> para una aplicación web o de backend sencilla.
      </p>
      <ul>
        <li>Incluye las fases mínimas: <strong>commit</strong>, <strong>linting</strong>, <strong>tests</strong>, <strong>build</strong> y <strong>deploy</strong>.</li>
        <li>Especifica qué herramienta podrías usar (por ejemplo, GitHub Actions, GitLab CI, Jenkins, etc.).</li>
        <li>Describe qué sucede en cada etapa y qué condiciones deben cumplirse para pasar a la siguiente.</li>
        <li>Opcionalmente, puedes representar el pipeline como un diagrama.</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>En el cuadro de texto, describe el pipeline (entre 400 y 700 palabras).</li>
        <li>Opcionalmente, adjunta un archivo (imagen o PDF) con un diagrama del pipeline.</li>
      </ul>
    `,
    openDate: '05 de enero de 2026, 00:00',
    closeDate: '11 de enero de 2026, 23:59',
    deliveryType: 'mixed'
  },

  '3-3': {
    title: 'Actividad: Manifiestos básicos de Kubernetes',
    descriptionHtml: `
      <p>
        Crea un pequeño conjunto de <strong>archivos YAML</strong> para desplegar una aplicación en Kubernetes.
      </p>
      <ul>
        <li>Define un <strong>Deployment</strong> con al menos 2 réplicas de un contenedor (puede ser una imagen pública, como <code>nginx</code>).</li>
        <li>Crea un <strong>Service</strong> que exponga el Deployment dentro del clúster (por ejemplo, tipo <code>ClusterIP</code> o <code>NodePort</code>).</li>
        <li>Opcional: añade un <strong>ConfigMap</strong> o <strong>Secret</strong> sencillo para ilustrar configuración.</li>
      </ul>
      <p><strong>Entrega:</strong></p>
      <ul>
        <li>Sube los archivos <code>.yaml</code> (Deployment, Service y opcionalmente ConfigMap/Secret).</li>
        <li>En el cuadro de texto, explica brevemente la función de cada manifiesto (qué despliega y cómo se expone).</li>
      </ul>
    `,
    openDate: '12 de enero de 2026, 00:00',
    closeDate: '18 de enero de 2026, 23:59',
    deliveryType: 'mixed'
  }
};

@Directive()
export abstract class AssignmentPageLogic implements OnInit {

  moduleId = '';
  topicId = '';

  moduleName = '';
  topicName = '';

  assignment?: Assignment;
  showCompleteMessage = false;
  uploadedFiles: File[] = [];

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.moduleId = params.get('modId') || '';
      this.topicId = params.get('topicId') || '';

      const key = `${this.moduleId}-${this.topicId}`;
      this.assignment = ASSIGNMENTS[key];

      this.moduleName = MODULE_NAMES[this.moduleId] || `Módulo ${this.moduleId}`;
      this.topicName =
        (TOPIC_NAMES[this.moduleId] && TOPIC_NAMES[this.moduleId][this.topicId]) ||
        `Tema ${this.topicId}`;
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.uploadedFiles = [];
    
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push(files[i]);
      }
    }
  }

  completeAssignment(): void {
    const modId = Number(this.moduleId);
    const topicId = Number(this.topicId);
    
    this.progress.completeActivity(modId, topicId, 'assignment');
    this.showCompleteMessage = true;

    // Mostrar mensaje por 2 segundos y luego redirigir
    setTimeout(() => {
      this.router.navigate(['/modulo', modId, 'tema', topicId]);
    }, 2000);
  }
}
