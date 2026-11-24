import {
  Directive,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgressService } from '../../../services/progress.service';

type QuestionType = 'single' | 'multi' | 'bool' | 'match' | 'text';

interface Option {
  value: string;
  label: string;
}

interface MatchItem {
  left: string;
  rightOptions: string[];
  correct: string;
}

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: Option[];            // single / multi / bool
  correct?: any;                 // string | string[] | boolean
  matches?: MatchItem[];         // match
}

interface Evaluation {
  title: string;
  description: string;
  minutes: number;
  questions: Question[];
}

// 🔥 TODAS LAS EVALUACIONES (9) – por módulo/tema
const EVALUATIONS: { [key: string]: Evaluation } = {
  // ========== MÓDULO 1 – DESARROLLO WEB ==========
  '1-1': {
    title: 'Evaluación: Fundamentos de HTML y CSS',
    description: 'Pon a prueba tus conocimientos básicos de estructura HTML y estilos CSS.',
    minutes: 30,
    questions: [
      {
        id: 'm1t1q1',
        type: 'single',
        question: '¿Qué etiqueta se utiliza para el título principal de una página?',
        options: [
          { value: 'h1', label: '<h1>' },
          { value: 'title', label: '<title>' },
          { value: 'p', label: '<p>' },
          { value: 'strong', label: '<strong>' }
        ],
        correct: 'h1'
      },
      {
        id: 'm1t1q2',
        type: 'single',
        question: '¿Cuál es la estructura básica correcta de un documento HTML?',
        options: [
          { value: 'a', label: '<html><head></head><body></body></html>' },
          { value: 'b', label: '<head><html></html><body></body></head>' },
          { value: 'c', label: '<body><head></head></body>' },
          { value: 'd', label: '<html><body></body></html>' }
        ],
        correct: 'a'
      },
      {
        id: 'm1t1q3',
        type: 'bool',
        question: 'La etiqueta <img> requiere etiqueta de cierre (</img>).',
        correct: 'false'
      },
      {
        id: 'm1t1q4',
        type: 'multi',
        question: '¿Cuáles de las siguientes son etiquetas semánticas de HTML5?',
        options: [
          { value: 'header', label: '<header>' },
          { value: 'footer', label: '<footer>' },
          { value: 'section', label: '<section>' },
          { value: 'b', label: '<b>' }
        ],
        correct: ['header', 'footer', 'section']
      },
      {
        id: 'm1t1q5',
        type: 'match',
        question: 'Relaciona cada propiedad CSS con lo que controla:',
        matches: [
          {
            left: 'color',
            rightOptions: ['Color del texto', 'Color de fondo', 'Tamaño de fuente', 'Margen externo'],
            correct: 'Color del texto'
          },
          {
            left: 'background-color',
            rightOptions: ['Color del texto', 'Color de fondo', 'Tamaño de fuente', 'Margen externo'],
            correct: 'Color de fondo'
          },
          {
            left: 'font-size',
            rightOptions: ['Color del texto', 'Color de fondo', 'Tamaño de fuente', 'Margen externo'],
            correct: 'Tamaño de fuente'
          },
          {
            left: 'margin',
            rightOptions: ['Color del texto', 'Color de fondo', 'Tamaño de fuente', 'Margen externo'],
            correct: 'Margen externo'
          }
        ]
      },
      {
        id: 'm1t1q6',
        type: 'single',
        question: '¿Qué atributo en la etiqueta <a> define la URL de destino?',
        options: [
          { value: 'src', label: 'src' },
          { value: 'href', label: 'href' },
          { value: 'link', label: 'link' },
          { value: 'url', label: 'url' }
        ],
        correct: 'href'
      },
      {
        id: 'm1t1q7',
        type: 'text',
        question: '¿Qué propiedad CSS se usa para cambiar el color de fondo de un elemento?',
        correct: 'background-color'
      },
      {
        id: 'm1t1q8',
        type: 'single',
        question: '¿Qué selector aplica estilos a todos los párrafos de una página?',
        options: [
          { value: 'p', label: 'p { ... }' },
          { value: '#p', label: '#p { ... }' },
          { value: '.p', label: '.p { ... }' },
          { value: 'allp', label: 'all p { ... }' }
        ],
        correct: 'p'
      },
      {
        id: 'm1t1q9',
        type: 'bool',
        question: 'CSS se puede incluir en línea, en el <head> o en un archivo externo.',
        correct: 'true'
      },
      {
        id: 'm1t1q10',
        type: 'single',
        question: '¿Cuál unidad se adapta al tamaño de fuente del elemento?',
        options: [
          { value: 'px', label: 'px' },
          { value: 'em', label: 'em' },
          { value: 'vh', label: 'vh' },
          { value: '%', label: '%' }
        ],
        correct: 'em'
      }
    ]
  },

  '1-2': {
    title: 'Evaluación: Fundamentos de JavaScript',
    description: 'Evalúa tus conocimientos básicos de variables, funciones y DOM en JavaScript.',
    minutes: 30,
    questions: [
      {
        id: 'm1t2q1',
        type: 'single',
        question: '¿Cuál es la forma correcta de declarar una variable que puede cambiar de valor?',
        options: [
          { value: 'var', label: 'var' },
          { value: 'let', label: 'let' },
          { value: 'const', label: 'const' },
          { value: 'static', label: 'static' }
        ],
        correct: 'let'
      },
      {
        id: 'm1t2q2',
        type: 'bool',
        question: 'const crea siempre una variable que nunca puede cambiar de referencia o valor.',
        correct: 'false'
      },
      {
        id: 'm1t2q3',
        type: 'single',
        question: '¿Cómo se escribe correctamente una función en JavaScript?',
        options: [
          { value: 'a', label: 'function miFuncion() { ... }' },
          { value: 'b', label: 'func miFuncion() { ... }' },
          { value: 'c', label: 'def miFuncion(): { ... }' },
          { value: 'd', label: 'fn miFuncion() => { ... }' }
        ],
        correct: 'a'
      },
      {
        id: 'm1t2q4',
        type: 'multi',
        question: '¿Cuáles son tipos de datos primitivos en JavaScript?',
        options: [
          { value: 'string', label: 'string' },
          { value: 'number', label: 'number' },
          { value: 'boolean', label: 'boolean' },
          { value: 'dom', label: 'DOMElement' }
        ],
        correct: ['string', 'number', 'boolean']
      },
      {
        id: 'm1t2q5',
        type: 'match',
        question: 'Relaciona cada término con su descripción:',
        matches: [
          {
            left: 'DOM',
            rightOptions: ['Árbol de nodos de la página', 'Código del servidor', 'Base de datos', 'Archivo CSS'],
            correct: 'Árbol de nodos de la página'
          },
          {
            left: 'Event listener',
            rightOptions: ['Función que escucha eventos', 'Hoja de estilos', 'Etiqueta HTML', 'Script externo'],
            correct: 'Función que escucha eventos'
          },
          {
            left: 'console.log',
            rightOptions: ['Imprime en la consola', 'Crea una variable', 'Crea un bucle', 'Define un estilo'],
            correct: 'Imprime en la consola'
          }
        ]
      },
      {
        id: 'm1t2q6',
        type: 'bool',
        question: 'El método querySelector permite seleccionar elementos del DOM usando selectores CSS.',
        correct: 'true'
      },
      {
        id: 'm1t2q7',
        type: 'single',
        question: '¿Qué operador se usa para comparar valores y tipo estrictamente?',
        options: [
          { value: '==', label: '==' },
          { value: '===', label: '===' },
          { value: '!=', label: '!=' },
          { value: '=>', label: '=>' }
        ],
        correct: '=== '
      },
      {
        id: 'm1t2q8',
        type: 'text',
        question: '¿Qué palabra clave se usa para declarar una constante en JavaScript?',
        correct: 'const'
      },
      {
        id: 'm1t2q9',
        type: 'single',
        question: '¿Qué estructura se usa para repetir un bloque de código hasta que una condición deje de cumplirse?',
        options: [
          { value: 'if', label: 'if' },
          { value: 'for', label: 'for' },
          { value: 'while', label: 'while' },
          { value: 'switch', label: 'switch' }
        ],
        correct: 'while'
      },
      {
        id: 'm1t2q10',
        type: 'bool',
        question: 'En JavaScript, una función puede devolverse como valor de otra función.',
        correct: 'true'
      }
    ]
  },

  '1-3': {
    title: 'Evaluación: Angular Básico',
    description: 'Comprueba tus conocimientos de componentes, data binding y servicios en Angular.',
    minutes: 30,
    questions: [
      {
        id: 'm1t3q1',
        type: 'single',
        question: '¿Qué decorador se utiliza para definir un componente en Angular?',
        options: [
          { value: 'component', label: '@Component' },
          { value: 'module', label: '@NgModule' },
          { value: 'injectable', label: '@Injectable' },
          { value: 'directive', label: '@Directive' }
        ],
        correct: 'component'
      },
      {
        id: 'm1t3q2',
        type: 'bool',
        question: 'Un componente Angular siempre está compuesto por HTML, CSS y un archivo TypeScript.',
        correct: 'true'
      },
      {
        id: 'm1t3q3',
        type: 'single',
        question: '¿Qué archivo define el módulo raíz de la aplicación Angular por defecto?',
        options: [
          { value: 'app.module.ts', label: 'app.module.ts' },
          { value: 'main.ts', label: 'main.ts' },
          { value: 'index.html', label: 'index.html' },
          { value: 'app.component.ts', label: 'app.component.ts' }
        ],
        correct: 'app.module.ts'
      },
      {
        id: 'm1t3q4',
        type: 'multi',
        question: '¿Cuáles de las siguientes son formas de data binding en Angular?',
        options: [
          { value: 'interpolation', label: 'Interpolación {{ }}' },
          { value: 'property', label: 'Property binding [ ]' },
          { value: 'event', label: 'Event binding ( )' },
          { value: 'sql', label: 'SQL binding' }
        ],
        correct: ['interpolation', 'property', 'event']
      },
      {
        id: 'm1t3q5',
        type: 'match',
        question: 'Relaciona el concepto Angular con su descripción:',
        matches: [
          {
            left: 'Service',
            rightOptions: ['Lógica reutilizable y acceso a datos', 'Define rutas', 'Plantilla HTML', 'Gestor de estilos'],
            correct: 'Lógica reutilizable y acceso a datos'
          },
          {
            left: 'RouterModule',
            rightOptions: ['Lógica reutilizable y acceso a datos', 'Define rutas', 'Plantilla HTML', 'Gestor de estilos'],
            correct: 'Define rutas'
          },
          {
            left: 'Template',
            rightOptions: ['Lógica reutilizable y acceso a datos', 'Define rutas', 'Plantilla HTML', 'Gestor de estilos'],
            correct: 'Plantilla HTML'
          }
        ]
      },
      {
        id: 'm1t3q6',
        type: 'bool',
        question: 'Los servicios en Angular se inyectan generalmente usando el patrón de inyección de dependencias.',
        correct: 'true'
      },
      {
        id: 'm1t3q7',
        type: 'text',
        question: '¿Qué comando de Angular CLI se usa para generar un nuevo componente?',
        correct: 'ng generate component'
      },
      {
        id: 'm1t3q8',
        type: 'single',
        question: '¿Qué selector se utiliza normalmente para mostrar el componente raíz en index.html?',
        options: [
          { value: 'app-root', label: '<app-root>' },
          { value: 'body', label: '<body>' },
          { value: 'main-root', label: '<main-root>' },
          { value: 'root', label: '<root>' }
        ],
        correct: 'app-root'
      },
      {
        id: 'm1t3q9',
        type: 'single',
        question: '¿Dónde se declaran los componentes que pertenecen a un módulo?',
        options: [
          { value: 'declarations', label: 'En la propiedad declarations de @NgModule' },
          { value: 'imports', label: 'En la propiedad imports de @NgModule' },
          { value: 'providers', label: 'En la propiedad providers de @NgModule' },
          { value: 'bootstrap', label: 'En la propiedad bootstrap de @NgModule' }
        ],
        correct: 'declarations'
      },
      {
        id: 'm1t3q10',
        type: 'bool',
        question: 'En Angular, los formularios reactivos utilizan FormGroup y FormControl.',
        correct: 'true'
      }
    ]
  },

  // ========== MÓDULO 2 – DESARROLLO MÓVIL ==========
  '2-1': {
    title: 'Evaluación: Introducción a Apps Móviles',
    description: 'Conceptos básicos de apps nativas, híbridas, UI y UX en móvil.',
    minutes: 30,
    questions: [
      {
        id: 'm2t1q1',
        type: 'single',
        question: '¿Qué es una app nativa?',
        options: [
          { value: 'a', label: 'App desarrollada para un sistema operativo específico (Android/iOS)' },
          { value: 'b', label: 'App que solo corre en navegador web' },
          { value: 'c', label: 'App que no necesita código' },
          { value: 'd', label: 'App basada únicamente en HTML y CSS' }
        ],
        correct: 'a'
      },
      {
        id: 'm2t1q2',
        type: 'bool',
        question: 'Una app híbrida combina tecnologías web con acceso a capacidades nativas.',
        correct: 'true'
      },
      {
        id: 'm2t1q3',
        type: 'single',
        question: '¿Qué característica es importante en una buena interfaz móvil (UI)?',
        options: [
          { value: 'a', label: 'Diseño claro y legible, fácil de tocar con el dedo' },
          { value: 'b', label: 'Muchos botones pequeños y cercanos' },
          { value: 'c', label: 'Colores muy saturados en todas las pantallas' },
          { value: 'd', label: 'Texto muy pequeño para aprovechar espacio' }
        ],
        correct: 'a'
      },
      {
        id: 'm2t1q4',
        type: 'match',
        question: 'Relaciona el concepto con su descripción:',
        matches: [
          {
            left: 'UX',
            rightOptions: ['Experiencia de usuario', 'Interfaz de usuario', 'Lenguaje de programación', 'Base de datos'],
            correct: 'Experiencia de usuario'
          },
          {
            left: 'UI',
            rightOptions: ['Experiencia de usuario', 'Interfaz de usuario', 'Lenguaje de programación', 'Base de datos'],
            correct: 'Interfaz de usuario'
          }
        ]
      },
      {
        id: 'm2t1q5',
        type: 'multi',
        question: '¿Cuáles elementos son comunes en el diseño de apps móviles?',
        options: [
          { value: 'navbar-bottom', label: 'Barra de navegación inferior' },
          { value: 'hamburger', label: 'Menú tipo hamburguesa' },
          { value: 'random-popups', label: 'Pop-ups aleatorios sin contexto' },
          { value: 'fab', label: 'Botón de acción flotante (FAB)' }
        ],
        correct: ['navbar-bottom', 'hamburger', 'fab']
      },
      {
        id: 'm2t1q6',
        type: 'bool',
        question: 'La responsividad es importante para adaptarse a diferentes tamaños de pantalla.',
        correct: 'true'
      },
      {
        id: 'm2t1q7',
        type: 'single',
        question: '¿Qué significa navegación en una app móvil?',
        options: [
          { value: 'a', label: 'Flujo entre pantallas dentro de la app' },
          { value: 'b', label: 'Uso de GPS en el dispositivo' },
          { value: 'c', label: 'Navegar por internet en el navegador' },
          { value: 'd', label: 'Mover archivos en el sistema' }
        ],
        correct: 'a'
      },
      {
        id: 'm2t1q8',
        type: 'text',
        question: 'Escribe una palabra clave importante al diseñar UX: ¿qué debemos evitar que sienta el usuario?',
        correct: 'frustración'
      },
      {
        id: 'm2t1q9',
        type: 'bool',
        question: 'Diseñar pensando primero en escritorio y luego adaptar a móvil siempre es la mejor estrategia.',
        correct: 'false'
      },
      {
        id: 'm2t1q10',
        type: 'single',
        question: '¿Qué tipo de app suele tener mejor rendimiento gráfico?',
        options: [
          { value: 'nativa', label: 'Nativa' },
          { value: 'hibrida', label: 'Híbrida' },
          { value: 'web', label: 'Web móvil' },
          { value: 'ninguna', label: 'Todas rinden igual' }
        ],
        correct: 'nativa'
      }
    ]
  },

  '2-2': {
    title: 'Evaluación: Flutter Básico',
    description: 'Widgets, layout y estado básico en Flutter.',
    minutes: 30,
    questions: [
      {
        id: 'm2t2q1',
        type: 'single',
        question: '¿En qué lenguaje se desarrolla Flutter principalmente?',
        options: [
          { value: 'dart', label: 'Dart' },
          { value: 'kotlin', label: 'Kotlin' },
          { value: 'swift', label: 'Swift' },
          { value: 'js', label: 'JavaScript' }
        ],
        correct: 'dart'
      },
      {
        id: 'm2t2q2',
        type: 'bool',
        question: 'En Flutter todo es un widget.',
        correct: 'true'
      },
      {
        id: 'm2t2q3',
        type: 'match',
        question: 'Relaciona el widget con su función:',
        matches: [
          {
            left: 'Container',
            rightOptions: ['Contenedor con padding, margen y decoración', 'Lista desplazable', 'Botón elevado', 'Organización en filas'],
            correct: 'Contenedor con padding, margen y decoración'
          },
          {
            left: 'Row',
            rightOptions: ['Contenedor con padding, margen y decoración', 'Lista desplazable', 'Botón elevado', 'Organización en filas'],
            correct: 'Organización en filas'
          },
          {
            left: 'ListView',
            rightOptions: ['Contenedor con padding, margen y decoración', 'Lista desplazable', 'Botón elevado', 'Organización en filas'],
            correct: 'Lista desplazable'
          }
        ]
      },
      {
        id: 'm2t2q4',
        type: 'single',
        question: '¿Qué widget se usa comúnmente como base de una pantalla con AppBar?',
        options: [
          { value: 'scaffold', label: 'Scaffold' },
          { value: 'materialapp', label: 'MaterialApp' },
          { value: 'container', label: 'Container' },
          { value: 'stack', label: 'Stack' }
        ],
        correct: 'scaffold'
      },
      {
        id: 'm2t2q5',
        type: 'multi',
        question: '¿Cuáles son tipos de widgets según su estado?',
        options: [
          { value: 'stateless', label: 'StatelessWidget' },
          { value: 'stateful', label: 'StatefulWidget' },
          { value: 'staticwidget', label: 'StaticWidget' },
          { value: 'magicwidget', label: 'MagicWidget' }
        ],
        correct: ['stateless', 'stateful']
      },
      {
        id: 'm2t2q6',
        type: 'bool',
        question: 'setState se utiliza para notificar a Flutter que el estado cambió y debe redibujar.',
        correct: 'true'
      },
      {
        id: 'm2t2q7',
        type: 'single',
        question: '¿Qué widget se usa para mostrar texto en Flutter?',
        options: [
          { value: 'text', label: 'Text' },
          { value: 'label', label: 'Label' },
          { value: 'span', label: 'Span' },
          { value: 'paragraph', label: 'Paragraph' }
        ],
        correct: 'text'
      },
      {
        id: 'm2t2q8',
        type: 'text',
        question: '¿Qué widget se usa para organizar otros widgets en una columna vertical?',
        correct: 'Column'
      },
      {
        id: 'm2t2q9',
        type: 'single',
        question: '¿Qué archivo suele definir el punto de entrada principal de una app Flutter?',
        options: [
          { value: 'main.dart', label: 'main.dart' },
          { value: 'app.dart', label: 'app.dart' },
          { value: 'index.dart', label: 'index.dart' },
          { value: 'run.dart', label: 'run.dart' }
        ],
        correct: 'main.dart'
      },
      {
        id: 'm2t2q10',
        type: 'bool',
        question: 'Flutter puede compilar a apps móviles, web y escritorio.',
        correct: 'true'
      }
    ]
  },

  '2-3': {
    title: 'Evaluación: React Native Básico',
    description: 'Componentes, hooks y conceptos esenciales de React Native.',
    minutes: 30,
    questions: [
      {
        id: 'm2t3q1',
        type: 'single',
        question: '¿En qué lenguaje se escribe React Native principalmente?',
        options: [
          { value: 'js', label: 'JavaScript / TypeScript' },
          { value: 'dart', label: 'Dart' },
          { value: 'java', label: 'Java puro' },
          { value: 'swift', label: 'Swift puro' }
        ],
        correct: 'js'
      },
      {
        id: 'm2t3q2',
        type: 'bool',
        question: 'React Native usa componentes para construir la interfaz.',
        correct: 'true'
      },
      {
        id: 'm2t3q3',
        type: 'match',
        question: 'Relaciona cada componente/hook con su función:',
        matches: [
          {
            left: 'View',
            rightOptions: ['Contenedor de layout', 'Texto en pantalla', 'Lista optimizada', 'Navegación'],
            correct: 'Contenedor de layout'
          },
          {
            left: 'Text',
            rightOptions: ['Contenedor de layout', 'Texto en pantalla', 'Lista optimizada', 'Navegación'],
            correct: 'Texto en pantalla'
          },
          {
            left: 'FlatList',
            rightOptions: ['Contenedor de layout', 'Texto en pantalla', 'Lista optimizada', 'Navegación'],
            correct: 'Lista optimizada'
          }
        ]
      },
      {
        id: 'm2t3q4',
        type: 'multi',
        question: '¿Cuáles hooks son propios de React?',
        options: [
          { value: 'usestate', label: 'useState' },
          { value: 'useeffect', label: 'useEffect' },
          { value: 'usetimer', label: 'useTimer' },
          { value: 'userouter', label: 'useRouter' }
        ],
        correct: ['usestate', 'useeffect']
      },
      {
        id: 'm2t3q5',
        type: 'single',
        question: '¿Qué componente se usa típicamente para hacer una zona “tappable” con efecto visual?',
        options: [
          { value: 'touchable', label: 'TouchableOpacity' },
          { value: 'view', label: 'View' },
          { value: 'image', label: 'Image' },
          { value: 'scroll', label: 'ScrollView' }
        ],
        correct: 'touchable'
      },
      {
        id: 'm2t3q6',
        type: 'bool',
        question: 'useState permite manejar el estado dentro de componentes funcionales.',
        correct: 'true'
      },
      {
        id: 'm2t3q7',
        type: 'single',
        question: '¿Cuál es el objetivo principal de NavigationContainer?',
        options: [
          { value: 'a', label: 'Habilitar la navegación entre pantallas' },
          { value: 'b', label: 'Mostrar imágenes' },
          { value: 'c', label: 'Aplicar estilos globales' },
          { value: 'd', label: 'Conectarse a la base de datos' }
        ],
        correct: 'a'
      },
      {
        id: 'm2t3q8',
        type: 'text',
        question: '¿Qué comando de CLI se usa comúnmente para crear un nuevo proyecto React Native con template oficial?',
        correct: 'npx react-native init'
      },
      {
        id: 'm2t3q9',
        type: 'bool',
        question: 'React Native utiliza componentes nativos debajo, no WebView para todo.',
        correct: 'true'
      },
      {
        id: 'm2t3q10',
        type: 'single',
        question: '¿Cuál es una ventaja de React Native?',
        options: [
          { value: 'a', label: 'Reutilización de código entre Android e iOS' },
          { value: 'b', label: 'Solo funciona en iOS' },
          { value: 'c', label: 'No requiere JavaScript' },
          { value: 'd', label: 'No necesita simuladores ni emuladores' }
        ],
        correct: 'a'
      }
    ]
  },

  // ========== MÓDULO 3 – DEVOPS ==========
  '3-1': {
    title: 'Evaluación: Docker y Contenedores',
    description: 'Evalúa conceptos de imágenes, contenedores y comandos básicos de Docker.',
    minutes: 30,
    questions: [
      {
        id: 'm3t1q1',
        type: 'single',
        question: '¿Qué es una imagen de Docker?',
        options: [
          { value: 'a', label: 'Plantilla inmutable para crear contenedores' },
          { value: 'b', label: 'Contenedor en ejecución' },
          { value: 'c', label: 'Servidor físico' },
          { value: 'd', label: 'Sistema operativo host' }
        ],
        correct: 'a'
      },
      {
        id: 'm3t1q2',
        type: 'bool',
        question: 'Un contenedor es una instancia en ejecución de una imagen.',
        correct: 'true'
      },
      {
        id: 'm3t1q3',
        type: 'match',
        question: 'Relaciona el comando con su función:',
        matches: [
          {
            left: 'docker build',
            rightOptions: ['Construye una imagen desde Dockerfile', 'Lista contenedores', 'Muestra logs', 'Elimina contenedores'],
            correct: 'Construye una imagen desde Dockerfile'
          },
          {
            left: 'docker run',
            rightOptions: ['Construye una imagen desde Dockerfile', 'Lista contenedores', 'Muestra logs', 'Elimina contenedores'],
            correct: 'Crea y ejecuta un contenedor'
          },
          {
            left: 'docker ps',
            rightOptions: ['Construye una imagen desde Dockerfile', 'Lista contenedores', 'Muestra logs', 'Elimina contenedores'],
            correct: 'Lista contenedores'
          }
        ]
      },
      {
        id: 'm3t1q4',
        type: 'multi',
        question: '¿Cuáles de estas afirmaciones sobre contenedores son correctas?',
        options: [
          { value: 'iso', label: 'Aíslan procesos' },
          { value: 'livianos', label: 'Son más livianos que máquinas virtuales' },
          { value: 'kernel-propio', label: 'Siempre incluyen su propio kernel' },
          { value: 'portables', label: 'Son fácilmente portables entre hosts' }
        ],
        correct: ['iso', 'livianos', 'portables']
      },
      {
        id: 'm3t1q5',
        type: 'single',
        question: '¿Qué archivo describe los pasos para construir una imagen?',
        options: [
          { value: 'dockerfile', label: 'Dockerfile' },
          { value: 'compose', label: 'docker-compose.yml' },
          { value: 'package', label: 'package.json' },
          { value: 'imagefile', label: 'imagefile' }
        ],
        correct: 'dockerfile'
      },
      {
        id: 'm3t1q6',
        type: 'bool',
        question: 'docker logs permite ver la salida de un contenedor.',
        correct: 'true'
      },
      {
        id: 'm3t1q7',
        type: 'single',
        question: '¿Qué comando se usa para descargar una imagen desde Docker Hub?',
        options: [
          { value: 'pull', label: 'docker pull' },
          { value: 'push', label: 'docker push' },
          { value: 'clone', label: 'docker clone' },
          { value: 'get', label: 'docker get' }
        ],
        correct: 'pull'
      },
      {
        id: 'm3t1q8',
        type: 'text',
        question: 'Escribe el comando base para listar imágenes locales en Docker.',
        correct: 'docker images'
      },
      {
        id: 'm3t1q9',
        type: 'bool',
        question: 'docker rm se utiliza para eliminar una imagen local.',
        correct: 'false'
      },
      {
        id: 'm3t1q10',
        type: 'single',
        question: '¿Qué opción se usa comúnmente para mapear puertos al ejecutar un contenedor?',
        options: [
          { value: 'p', label: '-p host:contenedor' },
          { value: 'v', label: '-v host:contenedor' },
          { value: 'e', label: '-e clave=valor' },
          { value: 'it', label: '-it' }
        ],
        correct: 'p'
      }
    ]
  },

  '3-2': {
    title: 'Evaluación: CI/CD Pipeline',
    description: 'Orden, fases y buenas prácticas de un pipeline moderno de CI/CD.',
    minutes: 30,
    questions: [
      {
        id: 'm3t2q1',
        type: 'single',
        question: '¿Qué representa CI en CI/CD?',
        options: [
          { value: 'integration', label: 'Continuous Integration' },
          { value: 'install', label: 'Continuous Install' },
          { value: 'interface', label: 'Continuous Interface' },
          { value: 'inspect', label: 'Continuous Inspect' }
        ],
        correct: 'integration'
      },
      {
        id: 'm3t2q2',
        type: 'bool',
        question: 'En un pipeline CI, las pruebas automáticas suelen ejecutarse en cada push o pull request.',
        correct: 'true'
      },
      {
        id: 'm3t2q3',
        type: 'match',
        question: 'Relaciona cada paso con su descripción:',
        matches: [
          {
            left: 'Linting',
            rightOptions: ['Analiza estilo/código estático', 'Construye artefacto', 'Despliega en producción', 'Ejecuta pruebas unitarias'],
            correct: 'Analiza estilo/código estático'
          },
          {
            left: 'Build',
            rightOptions: ['Analiza estilo/código estático', 'Construye artefacto', 'Despliega en producción', 'Ejecuta pruebas unitarias'],
            correct: 'Construye artefacto'
          },
          {
            left: 'Test',
            rightOptions: ['Analiza estilo/código estático', 'Construye artefacto', 'Despliega en producción', 'Ejecuta pruebas unitarias'],
            correct: 'Ejecuta pruebas unitarias'
          }
        ]
      },
      {
        id: 'm3t2q4',
        type: 'multi',
        question: '¿Qué beneficios aporta un pipeline CI/CD?',
        options: [
          { value: 'rapidez', label: 'Entrega más rápida de cambios' },
          { value: 'calidad', label: 'Mayor calidad por pruebas constantes' },
          { value: 'manual', label: 'Más pasos manuales obligatorios' },
          { value: 'feedback', label: 'Feedback temprano sobre errores' }
        ],
        correct: ['rapidez', 'calidad', 'feedback']
      },
      {
        id: 'm3t2q5',
        type: 'single',
        question: '¿En qué fase suele construirse la imagen Docker en un pipeline?',
        options: [
          { value: 'build', label: 'Durante la fase de build' },
          { value: 'lint', label: 'Durante el linting' },
          { value: 'prod', label: 'Después del despliegue a producción' },
          { value: 'ninguna', label: 'Nunca en el pipeline' }
        ],
        correct: 'build'
      },
      {
        id: 'm3t2q6',
        type: 'bool',
        question: 'Un buen pipeline CI/CD permite despliegues frecuentes y confiables.',
        correct: 'true'
      },
      {
        id: 'm3t2q7',
        type: 'single',
        question: '¿Qué entorno es ideal para probar antes de producción?',
        options: [
          { value: 'dev', label: 'Entorno de desarrollo personal' },
          { value: 'test', label: 'Entorno de pruebas / staging' },
          { value: 'prod', label: 'Producción directamente' },
          { value: 'local', label: 'Solo local del desarrollador' }
        ],
        correct: 'test'
      },
      {
        id: 'm3t2q8',
        type: 'text',
        question: 'Escribe el nombre de una plataforma popular de CI (por ejemplo, GitHub ____).',
        correct: 'actions'
      },
      {
        id: 'm3t2q9',
        type: 'bool',
        question: 'En CI/CD, la automatización es clave para reducir errores humanos.',
        correct: 'true'
      },
      {
        id: 'm3t2q10',
        type: 'single',
        question: '¿Cuál suele ser el último paso del pipeline?',
        options: [
          { value: 'deploy-prod', label: 'Despliegue en producción' },
          { value: 'lint', label: 'Linting' },
          { value: 'build', label: 'Build' },
          { value: 'test', label: 'Pruebas unitarias' }
        ],
        correct: 'deploy-prod'
      }
    ]
  },

  '3-3': {
    title: 'Evaluación: Kubernetes',
    description: 'Objetos fundamentales del orquestador: Pods, Services, Deployments, etc.',
    minutes: 30,
    questions: [
      {
        id: 'm3t3q1',
        type: 'single',
        question: '¿Qué es un Pod en Kubernetes?',
        options: [
          { value: 'a', label: 'La unidad mínima de ejecución con uno o más contenedores' },
          { value: 'b', label: 'Un clúster completo' },
          { value: 'c', label: 'Una base de datos interna' },
          { value: 'd', label: 'Un volumen de almacenamiento' }
        ],
        correct: 'a'
      },
      {
        id: 'm3t3q2',
        type: 'bool',
        question: 'Un Deployment puede gestionar ReplicaSets y actualizaciones de Pods.',
        correct: 'true'
      },
      {
        id: 'm3t3q3',
        type: 'match',
        question: 'Relaciona cada objeto con su función:',
        matches: [
          {
            left: 'Service',
            rightOptions: ['IP estable y balanceo vs pods', 'Gestión de pods con identidad persistente', 'Agrupa recursos lógicamente', 'Ingreso HTTP/HTTPS'],
            correct: 'IP estable y balanceo vs pods'
          },
          {
            left: 'Ingress',
            rightOptions: ['IP estable y balanceo vs pods', 'Gestión de pods con identidad persistente', 'Agrupa recursos lógicamente', 'Ingreso HTTP/HTTPS'],
            correct: 'Ingreso HTTP/HTTPS'
          },
          {
            left: 'Namespace',
            rightOptions: ['IP estable y balanceo vs pods', 'Gestión de pods con identidad persistente', 'Agrupa recursos lógicamente', 'Ingreso HTTP/HTTPS'],
            correct: 'Agrupa recursos lógicamente'
          }
        ]
      },
      {
        id: 'm3t3q4',
        type: 'multi',
        question: '¿Cuáles objetos se usan para almacenar configuración o secretos?',
        options: [
          { value: 'configmap', label: 'ConfigMap' },
          { value: 'secret', label: 'Secret' },
          { value: 'service', label: 'Service' },
          { value: 'pod', label: 'Pod' }
        ],
        correct: ['configmap', 'secret']
      },
      {
        id: 'm3t3q5',
        type: 'single',
        question: '¿Qué objeto asegura que cada nodo ejecute una copia de un Pod?',
        options: [
          { value: 'daemonset', label: 'DaemonSet' },
          { value: 'statefulset', label: 'StatefulSet' },
          { value: 'deployment', label: 'Deployment' },
          { value: 'job', label: 'Job' }
        ],
        correct: 'daemonset'
      },
      {
        id: 'm3t3q6',
        type: 'single',
        question: '¿Qué objeto está más orientado a cargas con identidad estable (por ejemplo, bases de datos)?',
        options: [
          { value: 'statefulset', label: 'StatefulSet' },
          { value: 'deployment', label: 'Deployment' },
          { value: 'replicaset', label: 'ReplicaSet' },
          { value: 'service', label: 'Service' }
        ],
        correct: 'statefulset'
      },
      {
        id: 'm3t3q7',
        type: 'bool',
        question: 'ConfigMap es adecuado para datos sensibles como contraseñas.',
        correct: 'false'
      },
      {
        id: 'm3t3q8',
        type: 'text',
        question: 'Escribe el objeto básico donde se definen contenedores: (respuesta en singular)',
        correct: 'Pod'
      },
      {
        id: 'm3t3q9',
        type: 'single',
        question: '¿Qué recurso se usa para asegurar un número deseado de Pods?',
        options: [
          { value: 'replicaset', label: 'ReplicaSet' },
          { value: 'service', label: 'Service' },
          { value: 'secret', label: 'Secret' },
          { value: 'namespace', label: 'Namespace' }
        ],
        correct: 'replicaset'
      },
      {
        id: 'm3t3q10',
        type: 'bool',
        question: 'Kubernetes es un orquestador de contenedores.',
        correct: 'true'
      }
    ]
  }
};

@Directive()
export abstract class EvaluationPageLogic implements OnInit, OnDestroy {

  moduleId!: string;
  topicId!: string;
  evaluation?: Evaluation;

  userResponses: { [questionId: string]: any } = {};

  // timer
  totalSeconds = 0;
  remainingSeconds = 0;
  elapsedSeconds = 0;
  timerInterval: any;
  timerDisplay = '30:00';
  timerPercent = 0;

  // resultado
  showResult = false;
  score = 0;
  maxScore = 0;
  passed = false;
  resultMessage = '';
  timeUpAutoSubmit = false;

  constructor(
    private route: ActivatedRoute,
    private progress: ProgressService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.moduleId = params.get('modId') || '';
      this.topicId = params.get('topicId') || '';
      const key = `${this.moduleId}-${this.topicId}`;
      this.evaluation = EVALUATIONS[key];

      this.resetState();
      if (this.evaluation) {
        this.setupInitialResponses();
        this.startTimer();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  resetState(): void {
    this.userResponses = {};
    this.showResult = false;
    this.score = 0;
    this.maxScore = this.evaluation ? this.evaluation.questions.length : 0;
    this.passed = false;
    this.resultMessage = '';
    this.timeUpAutoSubmit = false;
    this.clearTimer();
  }

  setupInitialResponses(): void {
    if (!this.evaluation) return;
    this.evaluation.questions.forEach(q => {
      if (q.type === 'match' && q.matches) {
        this.userResponses[q.id] = new Array(q.matches.length).fill('');
      } else if (q.type === 'multi') {
        this.userResponses[q.id] = [];
      } else {
        this.userResponses[q.id] = '';
      }
    });
  }

  // ========== TIMER 30 MIN con beep cada 10 ==========
  startTimer(): void {
    if (!this.evaluation) return;
    this.totalSeconds = (this.evaluation.minutes || 30) * 60;
    this.remainingSeconds = this.totalSeconds;
    this.elapsedSeconds = 0;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        this.elapsedSeconds++;
        this.updateTimerDisplay();
        this.updateTimerPercent();

        // beep cada 10 minutos (600s)
        if (this.elapsedSeconds > 0 && this.elapsedSeconds % 600 === 0) {
          this.playMidBeep();
        }
      } else {
        this.clearTimer();
        this.timeUpAutoSubmit = true;
        this.onSubmit(true);
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay(): void {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    const mm = m < 10 ? '0' + m : '' + m;
    const ss = s < 10 ? '0' + s : '' + s;
    this.timerDisplay = `${mm}:${ss}`;
  }

  updateTimerPercent(): void {
    const used = this.totalSeconds - this.remainingSeconds;
    this.timerPercent = this.totalSeconds > 0 ? (used / this.totalSeconds) * 100 : 0;
  }

  // ========== AUDIO ==========
  private audioCtx: AudioContext | null = null;

  private ensureAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        this.audioCtx = new AC();
      }
    }
    return this.audioCtx;
  }

  private beep(freq: number, duration = 0.15, gainValue = 0.15): void {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playMidBeep(): void {
    // beep suave cada 10 minutos
    this.beep(880, 0.12, 0.12);
  }

  playCorrectBeep(): void {
    this.beep(920, 0.12, 0.16);
  }

  playWrongBeep(): void {
    this.beep(220, 0.18, 0.18);
  }

  playTimeUpBeep(): void {
    this.beep(150, 0.25, 0.2);
  }

  // ========== MULTI-OPCIÓN (checkbox) ==========
  onMultiChange(questionId: string, optionValue: string, checked: boolean): void {
    if (!Array.isArray(this.userResponses[questionId])) {
      this.userResponses[questionId] = [];
    }
    const arr = this.userResponses[questionId] as string[];
    if (checked) {
      if (!arr.includes(optionValue)) {
        arr.push(optionValue);
      }
    } else {
      const idx = arr.indexOf(optionValue);
      if (idx >= 0) arr.splice(idx, 1);
    }
  }

  isMultiSelected(questionId: string, optionValue: string): boolean {
    const arr = this.userResponses[questionId] as string[] || [];
    return arr.includes(optionValue);
  }

  // ========== MATCH (select) ==========
  onMatchChange(questionId: string, index: number, value: string): void {
    if (!Array.isArray(this.userResponses[questionId])) {
      this.userResponses[questionId] = [];
    }
    const arr = this.userResponses[questionId] as string[];
    arr[index] = value;
  }

  // ========== SUBMIT ==========
  onSubmit(auto: boolean = false): void {
    if (!this.evaluation) return;
    this.clearTimer();
    this.calculateScore();
    this.showResult = true;

    // Criterio: 7 puntos o más para pasar
    this.passed = this.score >= 7;

    if (this.passed) {
      this.playCorrectBeep();
      // Desbloquear el siguiente tema
      const modId = Number(this.moduleId);
      const topId = Number(this.topicId);
      this.progress.completeTopic(modId, topId);
      
      // Verificar si todos los temas del módulo están completos para marcar módulo como completado
      this.checkModuleCompletion(modId);
    } else {
      this.playWrongBeep();
    }

    if (auto) {
      this.playTimeUpBeep();
      this.resultMessage = `Tiempo agotado. Tu puntuación fue ${this.score} de ${this.maxScore}. ` +
        (this.passed ? '¡Felicidades, nuevo tema desbloqueado! 🎉' : '¡Inténtalo nuevamente para desbloquear el siguiente tema!');
    } else {
      this.resultMessage = (this.passed ? '¡Felicidades, nuevo tema desbloqueado! 🎉' : '¡Inténtalo nuevamente para desbloquear el siguiente tema!');
    }
  }

  // Verificar si todos los temas del módulo están completados
  private checkModuleCompletion(moduleId: number): void {
    // Obtener el número de temas del módulo (cada módulo tiene 3 temas)
    const totalTopics = 3;
    let completedTopics = 0;
    
    for (let i = 1; i <= totalTopics; i++) {
      if (this.progress.isTopicCompleted(moduleId, i)) {
        completedTopics++;
      }
    }
    
    // Si todos los temas están completos, marcar el módulo como completado
    if (completedTopics === totalTopics) {
      this.progress.completeModule(moduleId);
    }
  }

  calculateScore(): void {
    if (!this.evaluation) return;
    let total = 0;
    this.evaluation.questions.forEach(q => {
      if (this.isQuestionCorrect(q)) {
        total++;
      }
    });
    this.score = total;
    this.maxScore = this.evaluation.questions.length;
  }

  isQuestionCorrect(q: Question): boolean {
    const user = this.userResponses[q.id];
    if (user === undefined || user === null) return false;

    switch (q.type) {
      case 'single':
        return user === q.correct;
      case 'bool':
        return String(user).toLowerCase() === String(q.correct).toLowerCase();
      case 'text':
        return (
          typeof user === 'string' &&
          typeof q.correct === 'string' &&
          user.trim().toLowerCase() === q.correct.trim().toLowerCase()
        );
      case 'multi':
        if (!Array.isArray(q.correct)) return false;
        const correctSet = new Set(q.correct as string[]);
        const userArr = Array.isArray(user) ? user as string[] : [];
        if (userArr.length !== correctSet.size) return false;
        for (const v of userArr) {
          if (!correctSet.has(v)) return false;
        }
        return true;
      case 'match':
        if (!q.matches || !Array.isArray(user)) return false;
        const userArrMatch = user as string[];
        if (userArrMatch.length !== q.matches.length) return false;
        for (let i = 0; i < q.matches.length; i++) {
          if (userArrMatch[i] !== q.matches[i].correct) return false;
        }
        return true;
      default:
        return false;
    }
  }

}
