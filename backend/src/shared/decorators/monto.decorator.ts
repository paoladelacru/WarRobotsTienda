export function ValidarMonto(campo?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metodoOriginal = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let monto: number | undefined;

            if (campo && args[0] && typeof args[0] === 'object') {
                monto = args[0][campo];
            } else if (typeof args[0] === 'number') {
                monto = args[0];
            } else if (args[0] && args[0] === 'object') {
                monto = args[0].monto_carrito ?? args[0].monto ?? args[0].cantidad;
            }

            if (monto === undefined || typeof monto !== 'number' || isNaN(monto)) {
                throw new Error(`[ValidarMonto] El monto es obligatorio y debe ser un número válido.`);
            }

            if (monto <= 0) {
                throw new Error(`[ValidarMonto] El monto debe ser mayor a 0. Recibido: ${monto}`);
            }

            console.log(`[ValidarMonto] Validación aprobada en '${propertyKey}'. Monto: ${monto}`);

            return metodoOriginal.apply(this, args);
        };

        return descriptor;
    };
}
