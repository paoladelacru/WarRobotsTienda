import { ApiService, FiltrosFrontend, ProductoFrontend } from '../shared/api.service';
import { CatalogoView } from './catalogo.view';

class CatalogoApp {
    private view: CatalogoView;
    private filtrosActuales: FiltrosFrontend = {
        es_chatarra: false,
        tipo: '',
        precio_max: 1500,
        busqueda: ''
    };

    // Referencias tipadas del DOM
    private tabFabrica: HTMLButtonElement;
    private tabChatarra: HTMLButtonElement;
    private inputSearch: HTMLInputElement;
    private selectType: HTMLSelectElement;
    private rangePrice: HTMLInputElement;
    private displayPrice: HTMLElement;
    private btnReset: HTMLButtonElement;

    constructor() {
        this.view = new CatalogoView();

        // Captura segura de controles
        this.tabFabrica = document.getElementById('tab-fabrica') as HTMLButtonElement;
        this.tabChatarra = document.getElementById('tab-chatarra') as HTMLButtonElement;
        this.inputSearch = document.getElementById('filter-search') as HTMLInputElement;
        this.selectType = document.getElementById('filter-type') as HTMLSelectElement;
        this.rangePrice = document.getElementById('filter-price') as HTMLInputElement;
        this.displayPrice = document.getElementById('price-display') as HTMLElement;
        this.btnReset = document.getElementById('btn-reset-filters') as HTMLButtonElement;

        this.vincularEventos();
        this.cargarCatalogo();
    }

    private vincularEventos(): void {
        // Cambio a pestaña Fábrica
        this.tabFabrica.addEventListener('click', () => {
            this.cambiarPestana(false);
        });

        // Cambio a pestaña Chatarrería
        this.tabChatarra.addEventListener('click', () => {
            this.cambiarPestana(true);
        });

        // Búsqueda en vivo por texto
        this.inputSearch.addEventListener('input', () => {
            this.filtrosActuales.busqueda = this.inputSearch.value;
            this.cargarCatalogo();
        });

        // Filtro por tipo/categoría
        this.selectType.addEventListener('change', () => {
            this.filtrosActuales.tipo = this.selectType.value;
            this.cargarCatalogo();
        });

        // Filtro por precio máximo
        this.rangePrice.addEventListener('input', () => {
            const valor = Number(this.rangePrice.value);
            this.displayPrice.textContent = `$${valor} CR`;
            this.filtrosActuales.precio_max = valor;
            this.cargarCatalogo();
        });

        // Botón restablecer
        this.btnReset.addEventListener('click', () => {
            this.inputSearch.value = '';
            this.selectType.value = '';
            this.rangePrice.value = '1500';
            this.displayPrice.textContent = '$1.500 CR';

            this.filtrosActuales.busqueda = '';
            this.filtrosActuales.tipo = '';
            this.filtrosActuales.precio_max = 1500;
            this.cargarCatalogo();
        });
    }

    private cambiarPestana(esChatarra: boolean): void {
        this.filtrosActuales.es_chatarra = esChatarra;

        if (esChatarra) {
            this.tabChatarra.classList.add('tabs__btn--active');
            this.tabChatarra.setAttribute('aria-selected', 'true');
            this.tabFabrica.classList.remove('tabs__btn--active');
            this.tabFabrica.setAttribute('aria-selected', 'false');
        } else {
            this.tabFabrica.classList.add('tabs__btn--active');
            this.tabFabrica.setAttribute('aria-selected', 'true');
            this.tabChatarra.classList.remove('tabs__btn--active');
            this.tabChatarra.setAttribute('aria-selected', 'false');
        }

        this.cargarCatalogo();
    }

    private async cargarCatalogo(): Promise<void> {
        try {
            this.view.mostrarCargando();
            const resultado = await ApiService.obtenerCatalogo(this.filtrosActuales);
            this.view.actualizarTitulo(Boolean(this.filtrosActuales.es_chatarra), resultado.total);
            this.view.renderizarProductos(resultado.items, (producto) => this.manejarCompra(producto));
        } catch (error) {
            console.error('Error cargando catálogo:', error);
            this.view.renderizarProductos([], () => { });
        }
    }

    private manejarCompra(producto: ProductoFrontend): void {
        alert(`🛒 ¡Seleccionaste adquirir ${producto.nombre_item} por $${producto.precio_final} CR!\n\n(Conectado con la API de compras del Módulo 1)`);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CatalogoApp();
});