export class CarritoView {
    // Referencias tipadas estrictas del DOM (HTML5)
    modal;
    btnAbrir;
    btnCerrar;
    badgeContador;
    contenedorItems;
    // Elementos de resumen y totales
    subtotalTexto;
    filaDescuento;
    descuentoTexto;
    totalTexto;
    // Elementos del cupón
    inputCupon;
    btnCupon;
    mensajeCupon;
    // Botones de acción
    btnVaciar;
    btnComprar;
    constructor() {
        // Captura y tipado seguro del DOM
        this.modal = document.getElementById('cart-modal');
        this.btnAbrir = document.getElementById('btn-open-cart');
        this.btnCerrar = document.getElementById('btn-close-cart');
        this.badgeContador = document.getElementById('cart-badge');
        this.contenedorItems = document.getElementById('cart-items-container');
        this.subtotalTexto = document.getElementById('cart-subtotal');
        this.filaDescuento = document.getElementById('cart-discount-row');
        this.descuentoTexto = document.getElementById('cart-discount');
        this.totalTexto = document.getElementById('cart-total');
        this.inputCupon = document.getElementById('coupon-input');
        this.btnCupon = document.getElementById('btn-apply-coupon');
        this.mensajeCupon = document.getElementById('coupon-message');
        this.btnVaciar = document.getElementById('btn-clear-cart');
        this.btnComprar = document.getElementById('btn-checkout');
        // Validación defensiva: verificar que todos los elementos existan en index.html
        if (!this.modal || !this.btnAbrir || !this.btnCerrar || !this.contenedorItems) {
            throw new Error('[CarritoView] No se encontraron elementos críticos del carrito en el DOM');
        }
    }
    /**
     * Abre el modal nativo accesible <dialog>
     */
    abrirModal() {
        this.modal.showModal();
    }
    /**
     * Cierra el modal nativo <dialog>
     */
    cerrarModal() {
        this.modal.close();
    }
    /**
     * Actualiza la burbujita roja de cantidad en el botón del encabezado
     */
    actualizarBadge(cantidadTotal) {
        this.badgeContador.textContent = String(cantidadTotal);
        this.badgeContador.setAttribute('aria-label', `${cantidadTotal} componentes en el carrito`);
    }
    /**
     * Renderiza la lista de ítems dentro del carrito
     */
    renderizarItems(resumen, acciones) {
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
    crearElementoItem(item, acciones) {
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
        const btnDec = div.querySelector('.btn-dec');
        const btnInc = div.querySelector('.btn-inc');
        const btnRemove = div.querySelector('.cart-item__btn-remove');
        btnDec.addEventListener('click', () => acciones.onDecrementar(item.producto.sku));
        btnInc.addEventListener('click', () => acciones.onIncrementar(item.producto.sku));
        btnRemove.addEventListener('click', () => acciones.onEliminar(item.producto.sku));
        return div;
    }
    /**
     * Actualiza los textos de subtotal, descuento y total final
     */
    actualizarTotales(resumen) {
        this.subtotalTexto.textContent = `$${resumen.totalBruto.toLocaleString()} CR`;
        this.totalTexto.textContent = `$${resumen.totalNeto.toLocaleString()} CR`;
        // Mostrar u ocultar la fila de descuento si hay un cupón activo
        if (resumen.descuento > 0) {
            this.filaDescuento.style.display = 'flex';
            this.descuentoTexto.textContent = `-$${resumen.descuento.toLocaleString()} CR`;
        }
        else {
            this.filaDescuento.style.display = 'none';
        }
    }
    /**
     * Muestra mensajes de feedback del cupón (éxito o error del backend)
     */
    mostrarMensajeCupon(mensaje, esExito) {
        this.mensajeCupon.textContent = mensaje;
        this.mensajeCupon.className = `coupon__message ${esExito ? 'coupon__message--success' : 'coupon__message--error'}`;
    }
    /**
     * Limpia el mensaje y el campo del cupón
     */
    limpiarCupon() {
        this.inputCupon.value = '';
        this.mensajeCupon.textContent = '';
        this.mensajeCupon.className = 'coupon__message';
    }
}
