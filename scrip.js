// scrip.js (Completo y Modificado)

document.addEventListener('DOMContentLoaded', function() {

    // ==================== SELECTORES GLOBALES DE ELEMENTOS DEL DOM ====================
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const searchBtn = document.getElementById('search-btn');
    
    // Para la página principal (index.html o similar)
    const productGridContainer = document.getElementById('product-grid-container');
    
    // Para la página del carrito (cart.html)
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSummaryActionsContainer = document.querySelector('.cart-summary-actions-container');

    // ==================== ESTADO DEL CARRITO ====================
    // Carga el carrito desde localStorage o inicia uno vacío.
    // 'products' (la lista completa de productos) viene del archivo products.js
    let cart = JSON.parse(localStorage.getItem('lionaticCart')) || [];

    // ==================== FUNCIONES DEL MENÚ MÓVIL ====================
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                menuToggle.setAttribute('aria-label', 'Cerrar menú');
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                menuToggle.setAttribute('aria-label', 'Abrir menú');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Cerrar menú al hacer clic en un enlace dentro del menú móvil
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    menuToggle.setAttribute('aria-label', 'Abrir menú');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // ==================== FUNCIONES DE LA PÁGINA PRINCIPAL (PRODUCTOS) ====================
    // MODIFICADA: Ahora acepta un filtro de categoría y un elemento contenedor
    function displayProducts(categoryFilter = null, containerElement = productGridContainer) {
        if (!containerElement || typeof products === 'undefined') {
            console.log("displayProducts: Contenedor o productos no disponibles.");
            if(containerElement) containerElement.innerHTML = `<p class="empty-category-message">No se pudieron cargar los productos.</p>`;
            return;
        }
        containerElement.innerHTML = ''; // Limpia el contenedor

        const productsToDisplay = categoryFilter
            ? products.filter(product => product.category === categoryFilter)
            : products; // Si no hay filtro, muestra todos (o una selección si se desea para index.html)

        if (productsToDisplay.length === 0) {
            containerElement.innerHTML = `<p class="empty-category-message">No hay productos en esta categoría por el momento. <a href="index.html">Ver todos los productos</a></p>`;
            return;
        }

        productsToDisplay.forEach(product => {
            const productCardHTML = `
                <div class="product-card">
                    <a href="#"> {/* TODO: Enlazar a una página de detalle del producto si la creas */}
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <h3><a href="#">${product.name}</a></h3>
                    ${product.oldPrice ? `<p class="old-price">$${product.oldPrice.toFixed(2)}</p>` : ''}
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-secondary add-to-cart-btn" data-product-id="${product.id}">Comprar</button>
                </div>
            `;
            containerElement.innerHTML += productCardHTML;
        });
        addEventListenersToProductCartButtons();
    }

    function addEventListenersToProductCartButtons() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.removeEventListener('click', handleAddToCartClick); // Previene múltiples listeners
            button.addEventListener('click', handleAddToCartClick);
        });
    }
    
    function handleAddToCartClick() {
        const productId = this.dataset.productId;
        addToCart(productId);
    }

    // ==================== FUNCIONES COMUNES DEL CARRITO (Añadir, Guardar, Actualizar Contador) ====================
    function addToCart(productId, quantity = 1) {
        if (typeof products === 'undefined') {
            console.error("Error en addToCart: La lista 'products' (de products.js) no está definida.");
            return;
        }
        const productToAdd = products.find(p => p.id === productId);
        if (!productToAdd) {
            console.error("Error en addToCart: Producto no encontrado con ID:", productId);
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: productToAdd.id,
                name: productToAdd.name,
                price: productToAdd.price,
                image: productToAdd.image,
                quantity: quantity
            });
        }
        saveCart();
        alert(`"${productToAdd.name}" se ha añadido al carrito.`);
        // console.log("Carrito actual:", cart);
    }

    function saveCart() {
        localStorage.setItem('lionaticCart', JSON.stringify(cart));
        updateCartCountDisplay();
        // Si estamos en la página del carrito, también actualizamos su vista
        if (window.location.pathname.endsWith('cart.html')) {
            displayCartItems();
        }
    }

    function updateCartCountDisplay() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
            cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    // ==================== FUNCIONES ESPECÍFICAS DE LA PÁGINA DEL CARRITO (cart.html) ====================
    function displayCartItems() {
        if (!cartItemsContainer) { // Solo ejecuta si estamos en la página del carrito
            return;
        }

        cartItemsContainer.innerHTML = ''; // Limpia la vista anterior
        if (cartSummaryActionsContainer) cartSummaryActionsContainer.innerHTML = ''; // Limpia resumen anterior

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-message">Tu carrito está vacío. <a href="index.html">Sigue comprando</a></p>`;
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('cart-items-list');

        cart.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('cart-item');
            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Precio: $${item.price.toFixed(2)}</p>
                    <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="btn btn-secondary btn-sm decrease-quantity" data-product-id="${item.id}" aria-label="Disminuir cantidad">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-product-id="${item.id}" class="item-quantity-input" readonly aria-label="Cantidad">
                    <button class="btn btn-secondary btn-sm increase-quantity" data-product-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-danger btn-sm remove-from-cart" data-product-id="${item.id}">Eliminar</button>
                </div>
            `;
            ul.appendChild(li);
        });
        cartItemsContainer.appendChild(ul);

        addEventListenersToCartPageButtons();
        displayCartSummary();
    }

    function displayCartSummary() {
        if (!cartSummaryActionsContainer || cart.length === 0) {
            return;
        }

        let subtotalGeneral = 0;
        cart.forEach(item => {
            subtotalGeneral += item.price * item.quantity;
        });
        const totalGeneral = subtotalGeneral; // Por ahora, total = subtotal

        cartSummaryActionsContainer.innerHTML = `
            <div class="cart-summary">
                <h3>Resumen del Pedido</h3>
                <p><span>Subtotal:</span> <span>$${subtotalGeneral.toFixed(2)}</span></p>
                <p class="total-price"><span>Total:</span> <span>$${totalGeneral.toFixed(2)}</span></p>
                <button class="btn btn-primary btn-checkout">Proceder al Pago (Simulado)</button>
            </div>
        `;

        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                alert("Redirigiendo a la página de pago (simulación)... Próximamente: checkout.html");
                // window.location.href = 'checkout.html'; // Descomentar cuando tengas checkout.html
            });
        }
    }

    function addEventListenersToCartPageButtons() {
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                updateQuantityInCart(this.dataset.productId, -1);
            });
        });
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                updateQuantityInCart(this.dataset.productId, 1);
            });
        });
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', function() {
                removeFromCart(this.dataset.productId);
            });
        });
    }

    function updateQuantityInCart(productId, change) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Elimina el producto si la cantidad es 0 o menos
            }
            saveCart(); // saveCart se encarga de refrescar la vista si estamos en cart.html
        }
    }

    function removeFromCart(productId) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const itemName = cart[itemIndex].name;
            cart = cart.filter(item => item.id !== productId);
            saveCart(); // saveCart se encarga de refrescar la vista
            alert(`"${itemName}" ha sido eliminado del carrito.`);
        }
    }

    // ==================== FUNCIONALIDAD DE BÚSQUEDA (Placeholder) ====================
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            alert("Funcionalidad de búsqueda (placeholder).\nEsto requeriría más lógica JS o un backend para ser funcional.");
        });
    }
    
    // ==================== SMOOTH SCROLL PARA ANCLAS (Opcional) ====================
    document.querySelectorAll('a[href^="#"], a[href^="/#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            let hrefAttribute = this.getAttribute('href');
            
            // Manejar enlaces tipo /#seccion o index.html#seccion desde otras páginas
            if ((hrefAttribute.startsWith('/#') || hrefAttribute.startsWith('index.html#')) && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                // Si no estamos en index.html, redirige a index.html con el hash
                let hash = hrefAttribute.split('#')[1];
                if (hash) {
                    window.location.href = 'index.html#' + hash;
                }
                return; // Detiene la ejecución del smooth scroll aquí
            }
            
            // Si es un enlace de sección normal (ej: #seccion) y estamos en la página correcta
            if (hrefAttribute.includes('#')) {
                const targetId = '#' + hrefAttribute.split('#')[1]; // Extrae solo el hash
                if (targetId.length > 1 && document.querySelector(targetId)) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const headerOffset = document.querySelector('.header') ? document.querySelector('.header').offsetHeight : 0;
                        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }
            }
        });
    });

    // ==================== INICIALIZACIÓN AL CARGAR LA PÁGINA ====================
    // MODIFICADA: Para manejar diferentes páginas de categoría
    function initPage() {
        updateCartCountDisplay(); // Siempre actualiza el contador del header

        const path = window.location.pathname;
        
        // El elemento 'product-grid-container-categoria' es común a todas las páginas de categoría
        const categoryProductGrid = document.getElementById('product-grid-container-categoria');

        if (path.endsWith('cart.html')) {
            displayCartItems();
        } else if (path.endsWith('celulares.html') && categoryProductGrid) {
            displayProducts('celulares', categoryProductGrid);
        } else if (path.endsWith('accesorios.html') && categoryProductGrid) {
            displayProducts('accesorios', categoryProductGrid);
        } else if (path.endsWith('audio.html') && categoryProductGrid) {
            displayProducts('audio', categoryProductGrid);
        } else if (path.endsWith('ofertas.html') && categoryProductGrid) {
            displayProducts('ofertas', categoryProductGrid);
        } else if (productGridContainer) { // Página principal (index.html o /)
            // En la página principal, 'productGridContainer' es el ID específico para productos destacados.
            // Aquí puedes decidir si mostrar todos o solo algunos como destacados.
            // Para mostrar todos:
            // displayProducts(null, productGridContainer); 
            // Para mostrar solo los primeros 4 como destacados (ejemplo):
            if (typeof products !== 'undefined') {
                const featured = products.slice(0, 4); // Tomar los primeros 4 productos como destacados
                // Temporalmente se crea una "pseudocategoría" para la función displayProducts si la modificas para aceptar un array
                // O, más simple, se modifica displayProducts para manejar esto.
                // Por ahora, la versión de displayProducts que te di mostrará TODOS si el filtro es null.
                // Si quieres un subconjunto específico para 'index.html', necesitarás adaptar 'displayProducts' o pasarle una lista filtrada.
                 displayProducts(null, productGridContainer); // Muestra todos por defecto en index
            }
        }
        // console.log("Página inicializada. Path:", path);

        // Simulación de login (si existe el formulario en la página actual)
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Funcionalidad de login (simulada). En un sitio real, esto enviaría datos a un servidor.');
            });
        }
    }

    initPage(); // Llama a la función de inicialización

    // console.log("Lionatic Store Front-End (DIY Mode) ¡listo!");
});