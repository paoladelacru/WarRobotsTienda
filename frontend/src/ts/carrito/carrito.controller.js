import { ApiService } from '../shared/api.service';
import { CarritoView } from './carrito.view';
export class CarritoController {
    view;
    items = [];
    cuponActivo = null;
    STORAGE_KEY = 'warbots_cart_data';
    constructor() {
        this.view = new CarritoView();
        this.cargarDeStorage();
        this.vincularEventos();
        this.actualizarTodo();
    }
    /**
     * Vincula los clics de los botones principales del modal
     */
    vincularEventos() {
        // Abrir y cerrar modal
        this.view.btnAbrir.addEventListener('click', () => this.view.abrirModal());
        this.view.btnCerrar.addEventListener('click', () => this.view.cerrarModal());
        // Botón para aplicar cupón de descuento (API 04)
        this.view.btnCupon.addEventListener('click', () => this.aplicarCupon());
        // Botón para vaciar todo el carrito
        this.view.btnVaciar.addEventListener('click', () => this.vaciarCarrito());
        // Botón para confirmar compra final (Checkout APIs 02 y 03)
        this.view.btnComprar.addEventListener('click', () => this.procesarCheckout());
    }
    /**
     * Agrega un robot o componente al carrito desde el catálogo
     */
    agregarProducto(producto) {
        const itemExistente = this.items.find(i => i.producto.sku === producto.sku);
        if (itemExistente) {
            // Regla oficial: la chatarra es pieza única embargada
            if (producto.es_chatarra) {
                alert(`⚠️ La pieza de chatarra '${producto.nombre_item}' es única. No puedes añadir más de 1 unidad.`);
                return;
            }
            // Validar stock disponible
            if (itemExistente.cantidad >= producto.stock_disponible) {
                alert(`⚠️ No hay más unidades disponibles de este componente (Stock: ${producto.stock_disponible}).`);
                return;
            }
            itemExistente.cantidad += 1;
        }
        else {
            this.items.push({ producto, cantidad: 1 });
        }
        this.guardarEnStorage();
        this.actualizarTodo();
        this.view.abrirModal(); // Abre el modal automáticamente para darle feedback al piloto
    }
    /**
     * Incrementa la cantidad de un ítem
     */
    incrementar(sku) {
        const item = this.items.find(i => i.producto.sku === sku);
        if (item && item.cantidad < item.producto.stock_disponible) {
            item.cantidad += 1;
            this.guardarEnStorage();
            this.actualizarTodo();
        }
    }
    /**
     * Disminuye la cantidad o lo elimina si llega a 0
     */
    decrementar(sku) {
        const item = this.items.find(i => i.producto.sku === sku);
        if (item) {
            item.cantidad -= 1;
            if (item.cantidad <= 0) {
                this.eliminar(sku);
                return;
            }
            this.guardarEnStorage();
            this.actualizarTodo();
        }
    }
    /**
     * Elimina un producto por completo del carrito
     */
    eliminar(sku) {
        this.items = this.items.filter(i => i.producto.sku !== sku);
        this.guardarEnStorage();
        this.actualizarTodo();
    }
    /**
     * Vacía todo el carrito
     */
    vaciarCarrito() {
        if (this.items.length === 0)
            return;
        this.items = [];
        this.cuponActivo = null;
        this.view.limpiarCupon();
        this.guardarEnStorage();
        this.actualizarTodo();
    }
    /**
     * Valida el cupón ingresado con el backend de compras (API 04)
     */
    async aplicarCupon() {
        const codigo = this.view.inputCupon.value.trim();
        if (!codigo) {
            this.view.mostrarMensajeCupon('Por favor ingresa un código de cupón.', false);
            return;
        }
        const resumen = this.calcularResumen();
        if (resumen.totalBruto <= 0) {
            this.view.mostrarMensajeCupon('Agrega productos al carrito antes de aplicar un cupón.', false);
            return;
        }
        try {
            // Llamada al backend con la intercepción AOP de @ValidarMonto
            const resultado = await ApiService.validarCupon(codigo, resumen.totalBruto);
            if (resultado.valido) {
                this.cuponActivo = { codigo, descuento: resultado.descuento_aplicado };
                this.view.mostrarMensajeCupon(resultado.mensaje || '¡Cupón aplicado!', true);
                this.actualizarTodo();
            }
        }
        catch (error) {
            this.cuponActivo = null;
            this.view.mostrarMensajeCupon(error instanceof Error ? error.message : 'Error al validar cupón', false);
            this.actualizarTodo();
        }
    }
    /**
     * Procesa la compra de todos los ítems consumiendo las APIs 02 y 03
     */
    async procesarCheckout() {
        if (this.items.length === 0) {
            alert('El carrito está vacío.');
            return;
        }
        const resumen = this.calcularResumen();
        const confirmar = confirm(`¿Deseas confirmar la compra por un total de $${resumen.totalNeto.toLocaleString()} CR?`);
        if (!confirmar)
            return;
        try {
            this.view.btnComprar.disabled = true;
            this.view.btnComprar.textContent = 'Procesando con Microservicio...';
            let ultimoSaldo = 1000;
            const recibos = [];
            // Procesamos cada ítem según su origen (Fábrica vs Chatarra)
            for (const item of this.items) {
                if (item.producto.es_chatarra) {
                    // API 03: Compra de Chatarra
                    const res = await ApiService.comprarEnChatarra(item.producto.sku);
                    recibos.push(`• ${item.producto.nombre_item}: TX ${res.transaccion_id}`);
                }
                else {
                    // API 02: Compra de Fábrica
                    const res = await ApiService.comprarEnFabrica(item.producto.sku, item.cantidad);
                    recibos.push(`• ${item.producto.nombre_item} (x${item.cantidad}): TX ${res.transaccion_id}`);
                    if (res.saldo !== undefined)
                        ultimoSaldo = res.saldo;
                }
            }
            // Actualizar la billetera visual en el encabezado
            const balanceElem = document.getElementById('wallet-balance');
            if (balanceElem) {
                balanceElem.textContent = `$${ultimoSaldo.toLocaleString()} CR`;
            }
            alert(`✅ ¡COMPRA EXITOSA EN EL SIMULADOR WAR-BOTS!\n\nTransacciones registradas:\n${recibos.join('\n')}\n\nNuevo Saldo Piloto: $${ultimoSaldo.toLocaleString()} CR`);
            // Limpiar carrito tras la compra exitosa
            this.items = [];
            this.cuponActivo = null;
            this.view.limpiarCupon();
            this.guardarEnStorage();
            this.actualizarTodo();
            this.view.cerrarModal();
        }
        catch (error) {
            alert(`❌ Error al procesar compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
        finally {
            this.view.btnComprar.disabled = false;
            this.view.btnComprar.textContent = 'Confirmar Compra';
        }
    }
    /**
     * Calcula los totales financieros
     */
    calcularResumen() {
        const totalBruto = this.items.reduce((acc, item) => acc + (item.producto.precio_final * item.cantidad), 0);
        const cantidadTotal = this.items.reduce((acc, item) => acc + item.cantidad, 0);
        const descuento = this.cuponActivo ? this.cuponActivo.descuento : 0;
        const totalNeto = Math.max(0, totalBruto - descuento);
        return {
            items: this.items,
            totalBruto,
            descuento,
            totalNeto,
            cantidadTotal,
            cuponCodigo: this.cuponActivo?.codigo
        };
    }
    /**
     * Sincroniza la vista completa
     */
    actualizarTodo() {
        const resumen = this.calcularResumen();
        this.view.actualizarBadge(resumen.cantidadTotal);
        this.view.renderizarItems(resumen, {
            onIncrementar: (sku) => this.incrementar(sku),
            onDecrementar: (sku) => this.decrementar(sku),
            onEliminar: (sku) => this.eliminar(sku)
        });
        this.view.actualizarTotales(resumen);
    }
    /**
     * Persistencia en el navegador (localStorage)
     */
    guardarEnStorage() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    }
    cargarDeStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                this.items = JSON.parse(data);
            }
        }
        catch {
            this.items = [];
        }
    }
}
