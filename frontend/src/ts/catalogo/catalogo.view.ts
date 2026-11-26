import { ProductoFrontend } from '../shared/api.service';

export class CatalogoView {
    private gridContainer: HTMLElement;
    private countElement: HTMLElement;
    private headingElement: HTMLElement;

    constructor() {
        // Tipado estricto del DOM
        this.gridContainer = document.getElementById('catalog-container') as HTMLElement;
        this.countElement = document.getElementById('catalog-count') as HTMLElement;
        this.headingElement = document.getElementById('catalog-heading') as HTMLElement;

        if (!this.gridContainer || !this.countElement || !this.headingElement) {
            throw new Error('No se encontraron elementos requeridos en el DOM');
        }
    }

    /**
     * Actualiza el encabezado y contador
     */
    public actualizarTitulo(esChatarra: boolean, total: number): void {
        this.headingElement.textContent = esChatarra
            ? '🔩 La Chatarrería / Piezas Reacondicionadas'
            : '🏭 Catálogo de Fábrica (100% Nuevos)';

        this.countElement.textContent = `Mostrando ${total} componente${total === 1 ? '' : 's'}`;
    }

    /**
     * Renderiza el estado de carga
     */
    public mostrarCargando(): void {
        this.gridContainer.innerHTML = `
      <div class="catalog__empty">
        <p>⚡ Sincronizando catálogo con el microservicio WAR-BOTS...</p>
      </div>
    `;
    }

    /**
     * Renderiza la lista de tarjetas BEM
     */
    public renderizarProductos(productos: ProductoFrontend[], onComprar: (producto: ProductoFrontend) => void): void {
        this.gridContainer.innerHTML = '';

        if (productos.length === 0) {
            this.gridContainer.innerHTML = `
        <div class="catalog__empty">
          <p>⚠️ No se encontraron piezas que coincidan con los filtros aplicados.</p>
        </div>
      `;
            return;
        }

        productos.forEach(producto => {
            const card = this.crearTarjeta(producto, onComprar);
            this.gridContainer.appendChild(card);
        });
    }

    /**
     * Construye una tarjeta HTML con metodología BEM
     */
    private crearTarjeta(producto: ProductoFrontend, onComprar: (p: ProductoFrontend) => void): HTMLElement {
        const article = document.createElement('article');
        article.className = `card ${producto.es_chatarra ? 'card--chatarra' : ''}`;

        // Determinar color de la barra de durabilidad (HP)
        const durabilidadPct = (producto.durabilidad_actual / (producto.durabilidad_max || 100)) * 100;
        let hpColorClass = 'card__hp-fill--high';
        if (durabilidadPct < 25) {
            hpColorClass = 'card__hp-fill--critical'; // Umbral crítico de embargo
        } else if (durabilidadPct < 75) {
            hpColorClass = 'card__hp-fill--medium';
        }

        article.innerHTML = `
      <div class="card__image-container">
        <img class="card__image" src="${producto.imagen_url}" alt="${producto.nombre_item}" loading="lazy" />
        <span class="card__badge-origin ${producto.es_chatarra ? 'card__badge-origin--chatarra' : 'card__badge-origin--fabrica'}">
          ${producto.es_chatarra ? `Descuento ${producto.descuento_porcentaje}%` : 'FÁBRICA NUEVO'}
        </span>
      </div>

      <div class="card__body">
        <span class="card__sku">${producto.sku} &bull; ${producto.tipo.toUpperCase()}</span>
        <h3 class="card__title">${producto.nombre_item}</h3>
        ${producto.nombre_robot ? `<p class="card__robot-name">🤖 Ex-Robot: ${producto.nombre_robot}</p>` : ''}
        <p class="card__desc">${producto.descripcion || 'Sin descripción técnica disponible.'}</p>

        <!-- Barra de vida / HP -->
        <div class="card__hp">
          <div class="card__hp-header">
            <span>Durabilidad (HP):</span>
            <span>${producto.durabilidad_actual.toFixed(0)} / ${producto.durabilidad_max}</span>
          </div>
          <div class="card__hp-bar" role="progressbar" aria-valuenow="${durabilidadPct}" aria-valuemin="0" aria-valuemax="100">
            <div class="card__hp-fill ${hpColorClass}" style="width: ${durabilidadPct}%;"></div>
          </div>
        </div>

        <!-- Estadísticas de Combate -->
        <div class="card__stats">
          <span>⚔️ Ataque: +${producto.fuerza_bono}</span>
          <span>🛡️ Blindaje: +${producto.defensa_bono}</span>
        </div>
      </div>

      <div class="card__footer">
        <div class="card__price-box">
          ${producto.es_chatarra ? `<span class="card__price-old">$${producto.precio_lista} CR</span>` : ''}
          <span class="card__price-current">$${producto.precio_final} CR</span>
        </div>
        <button class="card__btn-buy" type="button" aria-label="Comprar ${producto.nombre_item}">
          Adquirir
        </button>
      </div>
    `;

        // Vincular evento de compra
        const btnBuy = article.querySelector('.card__btn-buy') as HTMLButtonElement;
        btnBuy.addEventListener('click', () => onComprar(producto));

        return article;
    }
}