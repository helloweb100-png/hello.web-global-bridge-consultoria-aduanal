/* =====================================================================
   AVISOS Y NOTICIAS · Global Bridge ACAI Consultores Aduanales
   ---------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA PUBLICAR AVISOS.
   (No hace falta tocar index.html ni ningún otro archivo.)

   CÓMO PUBLICAR UN AVISO
   1. Copie el bloque de ejemplo que está en la lista "items" (va de { a },).
   2. Péguelo debajo de  items: [  (el aviso más nuevo va primero).
   3. Cambie los textos entre comillas y ponga  activo: true.
   4. Guarde este archivo y súbalo al sitio, en la misma carpeta que index.html.

   CÓMO QUITAR UN AVISO
   - Cambie  activo: true  por  activo: false  (queda guardado pero oculto), o
   - borre su bloque completo (de { a },).

   CAMPOS DE CADA AVISO
   activo   : true  = se muestra | false = oculto
   fecha    : "AAAA-MM-DD"            (ej. "2026-10-02")
   tipo     : "aduana" | "puerto" | "clima" | "noticia"
   titulo   : título corto
   texto    : descripción breve
   enlace   : (opcional) dirección web completa de la circular; empieza con https://
   vigencia : (opcional) "AAAA-MM-DD"; pasada esa fecha el aviso se oculta solo

   TIPO DE CAMBIO (opcional, para actualizar a primera hora)
   Llene valor, fecha y fuente. Para ocultarlo, deje  valor: "".

   IMPORTANTE: conserve las comillas ", las comas , y las llaves { } tal como están.
   Si el sitio deja de mostrar avisos, casi siempre es una coma o comilla faltante.
   ===================================================================== */
window.GB_AVISOS = {

    /* true = si no hay avisos, la sección muestra un mensaje.  false = la sección se oculta. */
    mostrarSiVacio: true,

    tipoCambio: {
        valor: "",        // ejemplo: "17.85"
        fecha: "",        // ejemplo: "2026-10-02"
        fuente: ""        // ejemplo: "DOF / Banxico"
    },

    items: [
        {
            activo: false,                       // ← cámbielo a true para publicarlo
            fecha: "2026-01-01",
            tipo: "puerto",                      // aduana | puerto | clima | noticia
            titulo: "Título del aviso",
            texto: "Descripción breve del aviso. Ejemplo: horarios, restricciones o condiciones que afectan la operación.",
            enlace: "",                          // opcional: https://...
            vigencia: ""                         // opcional: "2026-12-31"
        }
    ]
};
