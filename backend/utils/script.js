const mongoose = require('mongoose');
const Tarea = require('../models/tareas.model');

mongoose.connect('mongodb://127.0.0.1:27017/splitchores', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

const palabras1 = ['comprar', 'limpiar', 'lavar', 'hacer', 'arreglar'];
const palabras2 = ['cocina', 'baño', 'comida', 'deberes', 'jardín', 'ejercicio', 'gestiones'];
const acciones = [
  "Comprar arroz",
  "Lavar el coche",
  "Hacer la compra",
  "Pasear al perro",
  "Limpiar la casa",
  "Ir al gimnasio",
  "Cocinar la cena",
  "Estudiar para el examen",
  "Sacar la basura",
  "Regar las plantas"
];

function generarFrase() {
  const accion = acciones[Math.floor(Math.random() * acciones.length)];
  
  return accion;
}
function generarNombre() {
    const palabra1 = palabras1[Math.floor(Math.random() * palabras1.length)];
    const palabra2 = palabras2[Math.floor(Math.random() * palabras2.length)];
    return `${palabra1} ${palabra2}`;
  }

  function generarFechaAleatoria(inicio, fin) {
    const fechaInicio = inicio.getTime();
    const fechaFin = fin.getTime();
    const fechaAleatoria = new Date(fechaInicio + Math.random() * (fechaFin - fechaInicio));
    return fechaAleatoria;
  }

  function obtenerNivelDificultad() {
    // Genera un número aleatorio entre 0 y 1
    const random = Math.random();
  
    // Asigna el nivel de dificultad según el valor aleatorio generado
    if (random < 0.3) {
      return "facil";
    } else if (random < 0.7) {
      return "media";
    } else {
      return "dificil";
    }
  }
  

  const fechaInicio = new Date('2020-01-01');
  const fechaFin = new Date('2024-12-31');

  const ids = ['6627dca601302d20c6117980', '6627dc7701302d20c6117963', '66279511bac514043096c38c', '66204dca1a9de7faf701c8d9'];

  function obtenerIdAleatorio(ids) {
    // Genera un número aleatorio entre 0 y 3 (la longitud de la lista de IDs)
    const indiceAleatorio = Math.floor(Math.random() * ids.length);
    
    // Devuelve el ID correspondiente al índice aleatorio
    return ids[indiceAleatorio];
  }

  const colores = ['#86cc96', '#9395cd', '#F68f9c', '#82b7d3','#e4d98a','#e6a7d7'];

  function colorAleatorio(colores) {
    // Genera un número aleatorio entre 0 y 3 (la longitud de la lista de IDs)
    const indiceAleatorio = Math.floor(Math.random() * colores.length);
    
    // Devuelve el ID correspondiente al índice aleatorio
    return colores[indiceAleatorio];
  }
  

async function generarObjetos(cantidad) {
  for (let i = 0; i < cantidad; i++) {
    const tarea = new Tarea({
      nombre: generarFrase(),
      fechaLimite:generarFechaAleatoria(fechaInicio, fechaFin),
      dificultad: obtenerNivelDificultad(),
      recurrente: false,
      frecuencia:null,
      frecuenciaSemanal: [false,false,false,false,false,false,false],
      descripcion: 'una bonita descripción de la tarea a realizar',
      rotacion: null,
      completada: true,
      elegida: obtenerIdAleatorio(ids),
      usuario:obtenerIdAleatorio(ids),
      color:colorAleatorio(colores),
      fallida:Math.random() < 0.7 ? true : false



    });

    // Guardar el objeto en la base de datos
    await tarea.save();
  }
  console.log(`${cantidad} objetos generados.`);
}

// Llama a la función para generar objetos
const cantidadObjetos = 300; // Cambia este valor según la cantidad de objetos que desees generar
generarObjetos(cantidadObjetos);

// Manejo de eventos de conexión
db.on('error', console.error.bind(console, 'Error de conexión a la base de datos:'));
db.once('open', () => {
  console.log('Conexión establecida a la base de datos.');
});
