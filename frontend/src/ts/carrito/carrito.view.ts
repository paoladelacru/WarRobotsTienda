import { ItemCarrito, ResumenCarrito } from './carrito.model';

export interface AccionesItemCarrito {
    onIncrementar: (sku: string) => void;
    onDecrementar: (sku: string) => void;
    onEliminar: (sku: string) => void;
}

export class CarritoView {
    // Referencias tipadas estrictas del DOM (HTML5)
    public modal: HTMLDialogElement;
    public btnAbrir: HTMLButtonElement;
    public btnCerrar: HTMLButtonElement;
    public badgeContador: HTMLElement;
    public contenedorItems: HTMLElement;

    // Elementos de resumen y totales
    public subtotalTexto: HTMLElement;
    public filaDescuento: HTMLElement;
    public descuentoTexto: HTMLElement;
    public totalTexto: HTMLElement;

    // Elementos del cupón
    public inputCupon: HTMLInputElement;
    public btnCupon: HTMLButtonElement;
    public mensajeCupon: HTMLElement;

    // Botones de acción
    public btnVaciar: HTMLButtonElement;
    public btnComprar: HTMLButtonElement;

    constructor() {
        // Captura y tipado seguro del DOM
        this.modal = document.getElementById('cart-modal') as HTMLDialogElement;
        this.btnAbrir = document.getElementById('btn-open-cart') as HTMLButtonElement;
        this.btnCerrar = document.getElementById('btn-close-cart') as HTMLButtonElement;
        this.badgeContador = document.getElementById('cart-badge') as HTMLElement;
        this.contenedorItems = document.getElementById('cart-items-container') as HTMLElement;

        this.subtotalTexto = document.getElementById('cart-subtotal') as HTMLElement;
        this.filaDescuento = document.getElementById('cart-discount-row') as HTMLElement;
        this.descuentoTexto = document.getElementById('cart-discount') as HTMLElement;
        this.totalTexto = document.getElementById('cart-total') as HTMLElement;

        this.inputCupon = document.getElementById('coupon-input') as HTMLInputElement;
        this.btnCupon = document.getElementById('btn-apply-coupon') as HTMLButtonElement;
        this.mensajeCupon = document.getElementById('coupon-message') as HTMLElement;

        this.btnVaciar = document.getElementById('btn-clear-cart') as HTMLButtonElement;
        this.btnComprar = document.getElementById('btn-checkout') as HTMLButtonElement;

        // Validación defensiva: verificar que todos los elementos existan en index.html
        if (!this.modal || !this.btnAbrir || !this.btnCerrar || !this.contenedorItems) {
            throw new Error('[CarritoView] No se encontraron elementos críticos del carrito en el DOM');
        }
    }

    /**
     * Abre el modal nativo accesible <dialog>
     */
    public abrirModal(): void {
        this.modal.showModal();
    }

    /**
     * Cierra el modal nativo <dialog>
     */
    public cerrarModal(): void {
        this.modal.close();
    }

    /**
     * Actualiza la burbujita roja de cantidad en el botón del encabezado
     */
    public actualizarBadge(cantidadTotal: number): void {
        this.badgeContador.textContent = String(cantidadTotal);
        this.badgeContador.setAttribute('aria-label', `${cantidadTotal} componentes en el carrito`);
    }

    /**
     * Renderiza la lista de ítems dentro del carrito
     */
    public renderizarItems(resumen: ResumenCarrito, acciones: AccionesItemCarrito): void {
        this.contenedorItems.innerHTML = '';

        // Si el carrito está vacío
        if (resumen.items.length === 0) {
            this.contenedorItems.innerHTML = `
                <div class="cart-items__empty">
                    <p>🛒 Tu carrito está vacío.</p>
                    <small>Explora el catálogo y adquiere piezas para tu robot.</small>
                </div>
            `;
            return;
        }

        // Si tiene ítems, creamos cada tarjeta con BEM
        resumen.items.forEach(item => {
            const itemElement = this.crearElementoItem(item, acciones);
            this.contenedorItems.appendChild(itemElement);
        });
    }

    /**
     * Construye un ítem individual con metodología BEM y eventos
     */
    private crearElementoItem(item: ItemCarrito, acciones: AccionesItemCarrito): HTMLElement {
        const div = document.createElement('article');
        div.className = 'cart-item';

        div.innerHTML = `
            <img class="cart-item__image" src="${item.producto.imagen_url}" alt="${item.producto.nombre_item}" />
            
            <div class="cart-item__info">
                <span class="cart-item__title">${item.producto.nombre_item}</span>
                <span class="cart-item__price">$${item.producto.precio_final} CR c/u</span>
            </div>

            <div class="cart-item__controls">
                <button class="cart-item__btn-qty btn-dec" type="button" aria-label="Disminuir cantidad">-</button>
                <span class="cart-item__qty">${item.cantidad}</span>
                <button class="cart-item__btn-qty btn-inc" type="button" aria-label="Aumentar cantidad" ${item.producto.es_chatarra ? 'disabled title="La chatarra es pieza única"' : ''}>+</button>
                <button class="cart-item__btn-remove" type="button" aria-label="Eliminar ${item.producto.nombre_item}">🗑️</button>
            </div>
        `;

        // Vincular los eventos de los botones internos
        const btnDec = div.querySelector('.btn-dec') as HTMLButtonElement;
        const btnInc = div.querySelector('.btn-inc') as HTMLButtonElement;
        const btnRemove = div.querySelector('.cart-item__btn-remove') as HTMLButtonElement;

        btnDec.addEventListener('click', () => acciones.onDecrementar(item.producto.sku));
        btnInc.addEventListener('click', () => acciones.onIncrementar(item.producto.sku));
        btnRemove.addEventListener('click', () => acciones.onEliminar(item.producto.sku));

        return div;
    }

    /**
     * Actualiza los textos de subtotal, descuento y total final
     */
    public actualizarTotales(resumen: ResumenCarrito): void {
        this.subtotalTexto.textContent = `$${resumen.totalBruto.toLocaleString()} CR`;
        this.totalTexto.textContent = `$${resumen.totalNeto.toLocaleString()} CR`;

        // Mostrar u ocultar la fila de descuento si hay un cupón activo
        if (resumen.descuento > 0) {
            this.filaDescuento.style.display = 'flex';
            this.descuentoTexto.textContent = `-$${resumen.descuento.toLocaleString()} CR`;
        } else {
            this.filaDescuento.style.display = 'none';
        }
    }

    /**
     * Muestra mensajes de feedback del cupón (éxito o error del backend)
     */
    public mostrarMensajeCupon(mensaje: string, esExito: boolean): void {
        this.mensajeCupon.textContent = mensaje;
        this.mensajeCupon.className = `coupon__message ${esExito ? 'coupon__message--success' : 'coupon__message--error'}`;
    }

    /**
     * Limpia el mensaje y el campo del cupón
     */
    public limpiarCupon(): void {
        this.inputCupon.value = '';
        this.mensajeCupon.textContent = '';
        this.mensajeCupon.className = 'coupon__message';
    }
}