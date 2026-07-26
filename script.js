const diccionarioBraille = {
    'a': [1], 'b': [1, 2], 'c': [1, 4], 'd': [1, 4, 5], 'e': [1, 5],
    'f': [1, 2, 4], 'g': [1, 2, 4, 5], 'h': [1, 2, 5], 'i': [2, 4], 'j': [2, 4, 5],
    'k': [1, 3], 'l': [1, 2, 3], 'm': [1, 3, 4], 'n': [1, 3, 4, 5], 'ñ': [1, 2, 4, 5, 6],
    'o': [1, 3, 5], 'p': [1, 2, 3, 4], 'q': [1, 2, 3, 4, 5], 'r': [1, 2, 3, 5], 's': [2, 3, 4],
    't': [2, 3, 4, 5], 'u': [1, 3, 6], 'v': [1, 2, 3, 6], 'w': [2, 4, 5, 6], 'x': [1, 3, 4, 6],
    'y': [1, 3, 4, 5, 6], 'z': [1, 3, 5, 6], ' ': [],
    'á': [1, 2, 3, 5, 6], 'é': [2, 3, 4, 6], 'í': [3, 4], 'ó': [3, 4, 6], 'ú': [2, 3, 4, 5, 6], 'ü': [1, 2, 5, 6],
    '.': [2, 5, 6], ',': [2], ';': [2, 3], ':': [2, 5], '?': [2, 6], '¿': [2, 6],
    '!': [2, 3, 5], '¡': [2, 3, 5], '-': [3, 6], '(': [1, 2, 6], ')': [3, 4, 5], '"': [2, 3, 6]
};

const mapaNumeros = {
    '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e',
    '6': 'f', '7': 'g', '8': 'h', '9': 'i', '0': 'j'
};

const diccionarioUnicode = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠌', 'i': '⠊', 'j': '⠚',
    'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'ñ': '⠯', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎',
    't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
    'á': '⠿', 'é': '⠮', 'í': '⠌', 'ó': '⠬', 'ú': '⠾', 'ü': '⠣',
    '0': '⠼⠚', '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠌', '9': '⠼⠊',
    ',': '⠂', ';': '⠆', ':': '⠲', '.': '⠄', '?': '⠢', '¿': '⠢', '!': '⠔', '¡': '⠔', '-': '⠤', '(': '⠶', ')': '⠶', ' ': ' '
};

const PUNTOS_MAYUSCULA = [4, 6];
const PUNTOS_NUMERO = [3, 4, 5, 6];
const ORDEN_VISUAL = [1, 4, 2, 5, 3, 6];

// ELEMENTOS DOM
const botonConvertir = document.getElementById('botonConvertir');
const botonLimpiar = document.getElementById('botonLimpiar');
const botonVoz = document.getElementById('botonVoz');
const entradaTexto = document.getElementById('entradaTexto');
const resultadoBraille = document.getElementById('resultadoBraille');
const contador = document.getElementById('contador');
const salidaUnicode = document.getElementById('salidaUnicode');
const contenedorUnicode = document.getElementById('contenedorUnicode');
const contenedorVisual = document.getElementById('contenedorVisual');

// Textarea Auto-ajustable
entradaTexto.addEventListener('input', function() {
    entradaTexto.style.height = 'auto';
    entradaTexto.style.height = entradaTexto.scrollHeight + 'px';
    convertirABraille();
});

function crearCelda(puntosActivos, claseExtra, textoAccesible) {
    const celda = document.createElement('div');
    celda.classList.add('celda-braille');
    if (claseExtra) celda.classList.add(claseExtra);

    if (textoAccesible) {
        celda.setAttribute('role', 'img');
        celda.setAttribute('aria-label', textoAccesible);
    }

    for (const n of ORDEN_VISUAL) {
        const punto = document.createElement('div');
        punto.classList.add('punto');
        if (puntosActivos.includes(n)) {
            punto.classList.add('activo');
        }
        celda.appendChild(punto);
    }
    return celda;
}

function crearContenedorLetra(celda, textoDebajo) {
    const contenedorLetra = document.createElement('div');
    contenedorLetra.classList.add('contenedor-letra');

    const textoLetra = document.createElement('span');
    textoLetra.classList.add('texto-letra');
    textoLetra.textContent = textoDebajo;

    contenedorLetra.appendChild(celda);
    contenedorLetra.appendChild(textoLetra);
    return contenedorLetra;
}

function convertirABraille() {
    const texto = entradaTexto.value;
    resultadoBraille.innerHTML = '';
    salidaUnicode.textContent = '';

    if (!texto.trim()) {
        contenedorUnicode.style.display = 'none';
        contenedorVisual.style.display = 'none';
        contador.textContent = '';
        return;
    }

    let totalCeldas = 0;
    let totalNoReconocidos = 0;
    let textoUnicode = '';

    // Separamos por líneas fijas (Enters del usuario)
    const lineas = texto.split('\n');

    lineas.forEach(function (linea, indexLinea) {
        if (indexLinea > 0) textoUnicode += '\n';

        const filaLinea = document.createElement('div');
        filaLinea.classList.add('fila-linea');

        // Eliminamos espacios dobles o vacíos al principio/final de la línea
        const palabras = linea.trim().split(/\s+/);

        palabras.forEach(function (palabra, indice) {
            if (!palabra) return;

            const grupoPalabra = document.createElement('div');
            grupoPalabra.classList.add('grupo-palabra');

            let enModoNumero = false;

            for (let i = 0; i < palabra.length; i++) {
                const caracterOriginal = palabra[i];
                const esDigito = /[0-9]/.test(caracterOriginal);

                if (esDigito) {
                    if (!enModoNumero) {
                        grupoPalabra.appendChild(crearCelda(PUNTOS_NUMERO, null, 'Indicador de número'));
                        enModoNumero = true;
                    }
                    const letraEquivalente = mapaNumeros[caracterOriginal];
                    const puntos = diccionarioBraille[letraEquivalente];
                    const celda = crearCelda(puntos, null, `Letra ${caracterOriginal}`);
                    grupoPalabra.appendChild(crearContenedorLetra(celda, caracterOriginal));
                    textoUnicode += diccionarioUnicode[caracterOriginal] || caracterOriginal;
                    totalCeldas++;
                    continue;
                }

                enModoNumero = false;

                const esMayuscula = caracterOriginal !== caracterOriginal.toLowerCase();
                const letra = caracterOriginal.toLowerCase();
                const puntos = diccionarioBraille[letra];

                if (puntos === undefined) {
                    const celdaNoReconocida = crearCelda([], 'no-reconocida');
                    grupoPalabra.appendChild(crearContenedorLetra(celdaNoReconocida, '?'));
                    textoUnicode += caracterOriginal;
                    totalNoReconocidos++;
                    continue;
                }

                if (esMayuscula) {
                    grupoPalabra.appendChild(crearCelda(PUNTOS_MAYUSCULA, null, 'Indicador de mayúscula'));
                    textoUnicode += '⠠';
                }

                const celda = crearCelda(puntos, null, esMayuscula ? `Letra ${letra.toUpperCase()}` : `Letra ${letra}`);
                grupoPalabra.appendChild(crearContenedorLetra(celda, letra));
                textoUnicode += diccionarioUnicode[letra] || letra;
                totalCeldas++;
            }

            filaLinea.appendChild(grupoPalabra);

            if (indice < palabras.length - 1) {
                textoUnicode += ' ';
            }
        });

        resultadoBraille.appendChild(filaLinea);
    });

    salidaUnicode.textContent = textoUnicode;
    contenedorUnicode.style.display = 'block';
    contenedorVisual.style.display = 'block';

    const palabrasTotales = texto.trim().length === 0 ? 0 : texto.trim().split(/\s+/).length;
    let textoContador = `${palabrasTotales} palabra(s) · ${totalCeldas} celda(s) Braille`;
    if (totalNoReconocidos > 0) {
        textoContador += ` · ${totalNoReconocidos} símbolo(s) no reconocido(s)`;
    }
    contador.textContent = textoContador;
}

botonConvertir.addEventListener('click', convertirABraille);

botonLimpiar.addEventListener('click', function () {
    entradaTexto.value = '';
    entradaTexto.style.height = 'auto';
    resultadoBraille.innerHTML = '';
    salidaUnicode.textContent = '';
    contenedorUnicode.style.display = 'none';
    contenedorVisual.style.display = 'none';
    contador.textContent = '';
    entradaTexto.focus();
});

// COPIAR UNICODE
document.getElementById('botonCopiar').addEventListener('click', () => {
    navigator.clipboard.writeText(salidaUnicode.textContent);
    anunciarEnfoque('Braille copiado al portapapeles');
});

// DESCARGAR IMAGEN
// DESCARGAR COMO VECTOR (SVG transparente con saltos de línea y salto automático)
document.getElementById('botonDescargar').addEventListener('click', () => {
    const contenedorBraille = document.getElementById('resultadoBraille');
    const filas = contenedorBraille.querySelectorAll('.fila-linea');
    
    if (!filas.length) {
        alert('No hay nada para descargar.');
        return;
    }

    let svgContenido = '';
    const ANCHO_MAXIMO_CANVAS = 1000;
    let yActual = 0;

    filas.forEach((fila) => {
        let xActual = 0;
        const gruposPalabra = fila.querySelectorAll('.grupo-palabra');

        gruposPalabra.forEach((grupo) => {
            const contenedoresLetra = grupo.querySelectorAll('.contenedor-letra');
            const anchoPalabra = contenedoresLetra.length * 38;

            // Si la palabra sobrepasa el borde, salta de renglón y reinicia x a 0 (izquierda total)
            if (xActual + anchoPalabra > ANCHO_MAXIMO_CANVAS && xActual > 0) {
                xActual = 0;
                yActual += 85;
            }

            contenedoresLetra.forEach((contLetra) => {
                const celda = contLetra.querySelector('.celda-braille');
                const puntos = celda.querySelectorAll('.punto');
                const letraTexto = contLetra.querySelector('.texto-letra').textContent;

                puntos.forEach((punto, index) => {
                    const col = index % 2; 
                    const row = Math.floor(index / 2);
                    const cx = xActual + col * 16 + 8;
                    const cy = yActual + row * 15 + 8;
                    const esActivo = punto.classList.contains('activo');
                    const colorFill = esActivo ? '#2c3e50' : '#dddddd';

                    svgContenido += `<circle cx="${cx}" cy="${cy}" r="6" fill="${colorFill}" />`;
                });

                svgContenido += `<text x="${xActual + 15}" y="${yActual + 60}" font-family="Arial, sans-serif" font-size="14" fill="#555555" text-anchor="middle" font-weight="bold">${letraTexto}</text>`;

                xActual += 38;
            });

            xActual += 25; // Espacio entre palabras
        });

        yActual += 85; // Salto por Enter
    });

    const svgCompleto = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO_MAXIMO_CANVAS}" height="${yActual}" viewBox="0 0 ${ANCHO_MAXIMO_CANVAS} ${yActual}">
        ${svgContenido}
    </svg>`;

    const blob = new Blob([svgCompleto], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'braille_vectorial.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// VOZ Y LECTURA
function hablar(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-ES';
        window.speechSynthesis.speak(msg);
    }
}

document.getElementById('botonEscuchar').addEventListener('click', () => {
    if (entradaTexto.value) hablar(entradaTexto.value);
});

// --- RECONOCIMIENTO DE VOZ OFFLINE (WHISPER vía transformers.js) ---
let transcriptor = null;
let cargandoModelo = false;

async function obtenerTranscriptor() {
    if (transcriptor) return transcriptor;
    if (cargandoModelo) return null;
    cargandoModelo = true;

    botonVoz.textContent = '⏳ Descargando modelo...';
    botonVoz.disabled = true;

    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');

    transcriptor = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny',
        {
            progress_callback: (info) => {
                if (info.status === 'progress') {
                    const porcentaje = Math.round(info.progress);
                    botonVoz.textContent = `⏳ Descargando modelo... ${porcentaje}%`;
                }
            }
        }
    );

    cargandoModelo = false;
    botonVoz.textContent = '🎤 Hablar';
    botonVoz.disabled = false;
    return transcriptor;
}

async function convertirBlobAFloat32(blobAudio) {
    const arrayBuffer = await blobAudio.arrayBuffer();
    const contextoTemporal = new AudioContext();
    const audioDecodificado = await contextoTemporal.decodeAudioData(arrayBuffer);

    const contextoOffline = new OfflineAudioContext(
        1,
        Math.ceil(audioDecodificado.duration * 16000),
        16000
    );

    const fuente = contextoOffline.createBufferSource();
    fuente.buffer = audioDecodificado;
    fuente.connect(contextoOffline.destination);
    fuente.start(0);

    const audioResampleado = await contextoOffline.startRendering();
    contextoTemporal.close();

    return audioResampleado.getChannelData(0);
}

let grabadorActivo = null;
let fragmentosAudio = [];

async function iniciarGrabacion() {
    const transcriptorListo = await obtenerTranscriptor();
    if (!transcriptorListo) return; // El modelo todavía se está descargando

    const flujoMicrofono = await navigator.mediaDevices.getUserMedia({ audio: true });
    grabadorActivo = new MediaRecorder(flujoMicrofono);
    fragmentosAudio = [];

    grabadorActivo.ondataavailable = (evento) => fragmentosAudio.push(evento.data);

    grabadorActivo.onstop = async () => {
        flujoMicrofono.getTracks().forEach(pista => pista.stop());
        botonVoz.textContent = '🧠 Transcribiendo...';
        botonVoz.disabled = true;

        const blobAudio = new Blob(fragmentosAudio, { type: 'audio/webm' });
        const audioFloat32 = await convertirBlobAFloat32(blobAudio);

        const resultado = await transcriptor(audioFloat32, { language: 'spanish' });

        entradaTexto.value = resultado.text.trim();
        convertirABraille();

        botonVoz.textContent = '🎤 Hablar';
        botonVoz.disabled = false;
    };

    grabadorActivo.start();
    botonVoz.textContent = '🔴 Grabando... (clic para detener)';
}

botonVoz.addEventListener('click', () => {
    if (grabadorActivo && grabadorActivo.state === 'recording') {
        grabadorActivo.stop();
    } else {
        iniciarGrabacion();
    }
});

// MODO OSCURO
document.getElementById('botonModoOscuro').addEventListener('click', function () {
    document.body.classList.toggle('modo-oscuro');
    const estaActivo = document.body.classList.contains('modo-oscuro');
    this.setAttribute('aria-pressed', estaActivo);
});

// --- IDEA B: LÓGICA DEL TECLADO BRAILLE VIRTUAL (SIN MOVIMIENTOS Y AUDIO MEJORADO) ---
const celdaInteractiva = document.getElementById('celdaInteractiva');
const puntosSeleccionadosElemento = document.getElementById('puntosSeleccionados');
const letraDetectadaElemento = document.getElementById('letraDetectada');
const botonResetTeclado = document.getElementById('botonResetTeclado');

// Diccionario exhaustivo de nombres mostrados y hablados
const nombresEspeciales = {
    'Á': { visual: 'Á (A con tilde)', hablado: 'A con tilde' },
    'É': { visual: 'É (E con tilde)', hablado: 'E con tilde' },
    'Í': { visual: 'Í (I con tilde)', hablado: 'I con tilde' },
    'Ó': { visual: 'Ó (O con tilde)', hablado: 'O con tilde' },
    'Ú': { visual: 'Ú (U con tilde)', hablado: 'U con tilde' },
    'Ü': { visual: 'Ü (U con diéresis)', hablado: 'U con diéresis' },
    'Ñ': { visual: 'Ñ', hablado: 'Eñe' },
    ';': { visual: 'Punto y coma (;)', hablado: 'Punto y coma' },
    ',': { visual: 'Coma (,)', hablado: 'Coma' },
    '.': { visual: 'Punto (.)', hablado: 'Punto' },
    ':': { visual: 'Dos puntos (:)', hablado: 'Dos puntos' },
    '?': { visual: 'Signo de interrogación (?)', hablado: 'Signo de interrogación' },
    '¿': { visual: 'Signo de interrogación (¿)', hablado: 'Signo de interrogación' },
    '!': { visual: 'Signo de exclamación (!)', hablado: 'Signo de exclamación' },
    '¡': { visual: 'Signo de exclamación (¡)', hablado: 'Signo de exclamación' },
    '-': { visual: 'Guion (-)', hablado: 'Guion' },
    '(': { visual: 'Paréntesis ()', hablado: 'Paréntesis' },
    ')': { visual: 'Paréntesis ()', hablado: 'Paréntesis' },
    'Espacio': { visual: 'Espacio en blanco', hablado: 'Espacio' }
};

function hablarTexto(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-ES';
        mensaje.rate = 1.0;
        window.speechSynthesis.speak(mensaje);
    }
}

// Hacer los puntos del teclado virtual accesibles por teclado
celdaInteractiva.querySelectorAll('.punto').forEach(punto => {
    punto.setAttribute('role', 'button');
    punto.setAttribute('tabindex', '0');
    const numeroPunto = punto.getAttribute('data-punto');
    punto.setAttribute('aria-label', `Punto ${numeroPunto}, desactivado`);

    punto.addEventListener('keydown', function (evento) {
        if (evento.key === 'Enter' || evento.key === ' ') {
            evento.preventDefault();
            punto.click();
        }
    });
});

celdaInteractiva.querySelectorAll('.punto').forEach(punto => {
    punto.addEventListener('click', function () {
        this.classList.toggle('activo');

        const numeroPunto = this.getAttribute('data-punto');
        const estaActivo = this.classList.contains('activo');
        this.setAttribute('aria-label', `Punto ${numeroPunto}, ${estaActivo ? 'activado' : 'desactivado'}`);
        
        const datos = actualizarResultadoTeclado();
        const puntosActivos = datos.puntos;
        const caracterDetectado = datos.caracter;

        if (puntosActivos.length === 0) {
            hablarTexto("Celda vacía");
            return;
        }

        // Formatear lista de puntos hablados
        let textoPuntos = "";
        if (puntosActivos.length === 1) {
            textoPuntos = `Punto ${puntosActivos[0]}`;
        } else {
            const ult = puntosActivos[puntosActivos.length - 1];
            const resto = puntosActivos.slice(0, -1).join(', ');
            textoPuntos = `Puntos ${resto} y ${ult}`;
        }

        let mensajeVoz = textoPuntos;
        
        if (caracterDetectado === "INDICADOR_NUMERO") {
            mensajeVoz += ": Indicador de número. Se coloca antes de una cifra.";
        } else if (caracterDetectado === "INDICADOR_MAYUSCULA") {
            mensajeVoz += ": Indicador de mayúscula. Se coloca antes de una letra para hacerla mayúscula.";
        } else if (caracterDetectado === "Sin combinación") {
            mensajeVoz += ": No representa ningún carácter";
        } else {
            const infoEspecial = nombresEspeciales[caracterDetectado];
            const textoHablado = infoEspecial ? infoEspecial.hablado : caracterDetectado;
            mensajeVoz += `: ${textoHablado}`;
        }

        hablarTexto(mensajeVoz);
    });
});

function actualizarResultadoTeclado() {
    const puntosActivos = [];
    celdaInteractiva.querySelectorAll('.punto.activo').forEach(p => {
        puntosActivos.push(parseInt(p.getAttribute('data-punto')));
    });

    puntosActivos.sort((a, b) => a - b);

    if (puntosActivos.length === 0) {
        puntosSeleccionadosElemento.textContent = "Ninguno";
        letraDetectadaElemento.textContent = "Ninguno";
        return { puntos: [], caracter: "Ninguno" };
    }

    puntosSeleccionadosElemento.textContent = puntosActivos.join(', ');

    const esIgual = (arr1, arr2) => arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);

    let textoFinal = "Sin combinación";

    if (esIgual(puntosActivos, PUNTOS_MAYUSCULA)) {
        textoFinal = "INDICADOR_MAYUSCULA";
    } else if (esIgual(puntosActivos, PUNTOS_NUMERO)) {
        textoFinal = "INDICADOR_NUMERO";
    } else {
        for (const [letra, puntos] of Object.entries(diccionarioBraille)) {
            if (esIgual(puntos, puntosActivos)) {
                textoFinal = (letra === ' ') ? "Espacio" : letra.toUpperCase();
                break;
            }
        }
    }

    // Visualización en pantalla
    if (textoFinal === "INDICADOR_NUMERO") {
        letraDetectadaElemento.textContent = "Indicador de NÚMERO";
    } else if (textoFinal === "INDICADOR_MAYUSCULA") {
        letraDetectadaElemento.textContent = "Indicador de MAYÚSCULA";
    } else if (textoFinal === "Sin combinación") {
        letraDetectadaElemento.textContent = "Ninguno";
    } else if (nombresEspeciales[textoFinal]) {
        letraDetectadaElemento.textContent = nombresEspeciales[textoFinal].visual;
    } else {
        letraDetectadaElemento.textContent = textoFinal;
    }

    return { puntos: puntosActivos, caracter: textoFinal };
}

botonResetTeclado.addEventListener('click', function () {
    celdaInteractiva.querySelectorAll('.punto').forEach(p => p.classList.remove('activo'));
    actualizarResultadoTeclado();
    hablarTexto("Puntos reiniciados");
});

// --- GUÍA DE VOZ: anuncia el elemento enfocado al navegar con Tab ---
let guiaDeVozSilenciada = false;

function anunciarEnfoque(texto) {
    if (guiaDeVozSilenciada) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(texto);
        mensaje.lang = 'es-ES';
        mensaje.rate = 1.0;
        window.speechSynthesis.speak(mensaje);
    }
}

document.getElementById('botonSilenciar').addEventListener('click', function () {
    guiaDeVozSilenciada = !guiaDeVozSilenciada;
    this.setAttribute('aria-pressed', guiaDeVozSilenciada);
    this.textContent = guiaDeVozSilenciada ? '🔇 Guía silenciada' : '🔊 Silenciar guía';

    // Este mensaje se dice SIEMPRE, incluso si se acaba de silenciar,
    // para confirmar el cambio de estado
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(guiaDeVozSilenciada ? 'Guía de voz silenciada' : 'Guía de voz activada');
        mensaje.lang = 'es-ES';
        window.speechSynthesis.speak(mensaje);
    }
});

document.addEventListener('focusin', function (evento) {
    const elemento = evento.target;

    // Caso especial: puntos del teclado Braille virtual (no tienen data-anuncio fijo,
    // porque cada uno es "Punto 1", "Punto 2", etc. según su número)
    if (elemento.classList && elemento.classList.contains('punto') && elemento.hasAttribute('data-punto')) {
        const numeroPunto = elemento.getAttribute('data-punto');
        anunciarEnfoque(`Punto ${numeroPunto}`);
        return;
    }

    // Resto de elementos: lee el texto guardado en data-anuncio, si existe
    const textoAnuncio = elemento.getAttribute && elemento.getAttribute('data-anuncio');
    if (textoAnuncio) {
        anunciarEnfoque(textoAnuncio);
    }
});

// Mensaje de bienvenida — se dispara con la PRIMERA interacción real (clic o tecla),
// porque los navegadores bloquean el audio/voz automático sin interacción del usuario
let bienvenidaReproducida = false;

function reproducirBienvenida() {
    if (bienvenidaReproducida) return;
    bienvenidaReproducida = true;
    anunciarEnfoque('Hola, bienvenido a Contacto. Navegá con la tecla Tab para escuchar cada botón, y presioná Enter o Espacio para activarlo.');
}

document.addEventListener('keydown', reproducirBienvenida, { once: true });
document.addEventListener('click', reproducirBienvenida, { once: true });