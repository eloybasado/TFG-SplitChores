function calcularFechaRecurrente(tarea,modo) {

    console.log('entra en util')
                if(modo===true){
                if(tarea.frecuenciaSemanal.includes(true)){
                    //se han elegido uno o varios dias especificos
                    const diaSemanaActual = new Date().getDay();
    
                    // encontrar la primera posición true a partir del diaa de la semana actual
                    let primerDiaTrue = tarea.frecuenciaSemanal.indexOf(true, diaSemanaActual);
    
                    //si no hay, se busca desde lunes
                    if (primerDiaTrue === -1) {
                        primerDiaTrue = tarea.frecuenciaSemanal.indexOf(true)+7;
                    }
    
                    primerDiaTrue++;
    
                    // console.log('primer dia a true',primerDiaTrue,'diaSemanaActual',diaSemanaActual)
                    const fechaInicioTarea = new Date();
                    fechaInicioTarea.setDate(fechaInicioTarea.getDate() + primerDiaTrue - diaSemanaActual);
                    tarea.fechaLimite=fechaInicioTarea;

                     

                   
                }else{
                    // Obtener la fecha de hoy
                    const fechaHoy = new Date();
                    const nuevaFecha = new Date(fechaHoy);
                    nuevaFecha.setDate(fechaHoy.getDate() + tarea.frecuencia);
                    tarea.fechaLimite=nuevaFecha;
                }
            }else{

                if(tarea.frecuenciaSemanal.includes(true)){
                    //se han elegido uno o varios dias especificos
                    const diaSemanaActual = (new Date(tarea.fechaLimite).getDay() + 6) % 7;
                    const fechaLimiteAntigua=new Date(tarea.fechaLimite);
                    console.log(diaSemanaActual)
                    // encontrar la primera posición true a partir del diaa de la semana actual
                    let primerDiaTrue = tarea.frecuenciaSemanal.indexOf(true, diaSemanaActual+1);
                    console.log(primerDiaTrue)
                    //si no hay, se busca desde lunes
                    if (primerDiaTrue === -1) {
                        primerDiaTrue = tarea.frecuenciaSemanal.indexOf(true)+7;
                    }
                    const fechaInicioTarea = new Date();
                    
                    fechaLimiteAntigua.setDate(fechaLimiteAntigua.getDate() + primerDiaTrue - diaSemanaActual);

                    tarea.fechaLimite=fechaLimiteAntigua;

                     

                   
                }else{
                    // Obtener la fecha limite
                    const nuevaFecha = new Date(tarea.fechaLimite);
                    nuevaFecha.setDate(tarea.fechaLimite.getDate() + tarea.frecuencia);
                    tarea.fechaLimite=nuevaFecha;
                }

            }

                return tarea.fechaLimite;
  }
  

  
module.exports = { calcularFechaRecurrente }