function calcularUsuario(nuevaTareaRecurrente,tarea) {
const actual = nuevaTareaRecurrente.rotacion.indexOf(tarea.elegida);
if(actual!==-1){

    let siguiente = (actual + 1) % nuevaTareaRecurrente.rotacion.length;
    if (siguiente === nuevaTareaRecurrente.rotacion.length) {
        siguiente = 0;
      }

      nuevaTareaRecurrente.elegida=nuevaTareaRecurrente.rotacion[siguiente];
    }else{

        return  res.status(400).json({
            ok:false,
            msg:'Error reasignando la tarea'
        })
    }

    console.log(nuevaTareaRecurrente.elegida)
    return nuevaTareaRecurrente.elegida;

    
  
}
  module.exports = { calcularUsuario }