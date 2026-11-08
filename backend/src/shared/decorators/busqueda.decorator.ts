/**
 * Decorador de Método AOP: @LogBusqueda
 * Intercepta cualquier método de búsqueda/filtrado de catálogo,
 * registrando los filtros aplicados, la cantidad de resultados obtenidos
 * y el tiempo de respuesta en milisegundos.
 */
export function LogBusqueda() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const metodoOriginal = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const inicio = performance.now();
            const filtros = args[0] || {};

            console.log(`\n[AOP @LogBusqueda] === INICIO DE CONSULTA ===`);
            console.log(`Método interceptado: ${propertyKey}`);
            console.log(`Filtros recibidos:`, JSON.stringify(filtros, null, 2));

            // Ejecutar el método original de búsqueda
            const resultado = metodoOriginal.apply(this, args);

            // Si el método devuelve una promesa (es asíncrono)
            if (resultado instanceof Promise) {
                return resultado.then((res) => {
                    const fin = performance.now();
                    const totalItems = res?.total ?? (Array.isArray(res?.items) ? res.items.length : 'N/A');
                    console.log(`[AOP @LogBusqueda] Resultados encontrados: ${totalItems}`);
                    console.log(`Tiempo de respuesta: ${(fin - inicio).toFixed(2)} ms`);
                    console.log(`[AOP @LogBusqueda] === FIN DE CONSULTA ===\n`);
                    return res;
                });
            }

            // Si es sincrónico
            const fin = performance.now();
            const totalItems = resultado?.total ?? (Array.isArray(resultado?.items) ? resultado.items.length : 'N/A');
            console.log(`[AOP @LogBusqueda] Resultados encontrados: ${totalItems}`);
            console.log(`Tiempo de respuesta: ${(fin - inicio).toFixed(2)} ms`);
            console.log(`[AOP @LogBusqueda] === FIN DE CONSULTA ===\n`);

            return resultado;
        };

        return descriptor;
    };
}