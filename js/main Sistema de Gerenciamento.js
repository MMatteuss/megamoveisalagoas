document.addEventListener('DOMContentLoaded', function() {
    // Dados iniciais (simulando um banco de dados)
    let products = [
        {
            id: 1,
            name: "Sofá Capelinha 3 Lugares",
            category: "Sofás",
            price: 1899.90,
            description: "Sofá em couro sintético, estrutura em madeira maciça",
            stock: 15,
            code: "SOF001",
            images: ["sofa1.jpg"],
            status: "active"
        },
        {
            id: 2,
            name: "Mesa de Jantar Retrátil",
            category: "Mesas",
            price: 799.90,
            description: "Mesa em MDF com tampo lacado, capacidade para 6 a 8 pessoas",
            stock: 8,
            code: "MES002",
            images: ["mesa1.jpg"],
            status: "active"
        },
        {
            id: 3,
            name: "Roupeiro Capelinha Branco",
            category: "Armários",
            price: 1299.90,
            description: "Roupeiro branco brilho com 6 portas e 2 gavetas",
            stock: 3,
            code: "ARM003",
            images: ["armario1.jpg"],
            status: "low"
        },
        {
            id: 4,
            name: "Cama Box Queen Size",
            category: "Camas",
            price: 1599.90,
            description: "Cama box com colchão incluso, estrutura em madeira",
            stock: 0,
            code: "CAM004",
            images: ["cama1.jpg"],
            status: "out"
        }
    ];

    let categories = ["Sofás", "Mesas", "Armários", "Camas", "Cadeiras", "Decoração"];

    // Elementos do DOM
    const productsTable = document.getElementById('products-table');
    const productsTableBody = productsTable.querySelector('tbody');
    const categoryFilter = document.getElementById('category-filter');
    const productSearch = document.getElementById('product-search');
    const addProductBtn = document.getElementById('add-product');
    const manageCategoriesBtn = document.getElementById('manage-categories');
    const viewReportsBtn = document.getElementById('view-reports');
    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf');
    
    // Modais
    const productModal = document.getElementById('product-modal');
    const categoriesModal = document.getElementById('categories-modal');
    const reportsModal = document.getElementById('reports-modal');
    const loginModal = document.getElementById('login-modal');
    
    // Formulários
    const productForm = document.getElementById('product-form');
    const loginForm = document.getElementById('login-form');
    
    // Variáveis de estado
    let currentProductId = null;
    let isEditMode = false;

    // Inicialização
    loadProducts();
    loadCategories();
    setupEventListeners();

    // Funções principais
    function loadProducts(filterCategory = '', searchTerm = '') {
        productsTableBody.innerHTML = '';
        
        const filteredProducts = products.filter(product => {
            const matchesCategory = filterCategory === '' || product.category === filterCategory;
            const matchesSearch = searchTerm === '' || 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                product.code.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
        
        if (filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="text-center">Nenhum produto encontrado</td>`;
            productsTableBody.appendChild(row);
            return;
        }
        
        filteredProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="assets/${product.images[0] || 'placeholder.jpg'}" alt="${product.name}" class="product-image"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td><span class="status-badge status-${product.status}">${
                    product.status === 'active' ? 'Disponível' : 
                    product.status === 'low' ? 'Estoque Baixo' : 'Esgotado'
                }</span></td>
                <td>
                    <button class="action-btn edit-btn" data-id="${product.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${product.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
        
        // Adiciona eventos aos botões de ação
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
        });
    }

    function loadCategories() {
        // Carrega categorias no filtro
        categoryFilter.innerHTML = '<option value="">Todas categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Carrega categorias no formulário de produto
        const productCategorySelect = document.getElementById('product-category');
        productCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            productCategorySelect.appendChild(option);
        });
        
        // Carrega categorias na modal de gerenciamento
        const categoriesList = document.getElementById('categories-list');
        categoriesList.innerHTML = '';
        categories.forEach((category, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${category}
                <span class="category-actions">
                    <i class="fas fa-edit edit-category" data-index="${index}"></i>
                    <i class="fas fa-trash-alt delete-category" data-index="${index}"></i>
                </span>
            `;
            categoriesList.appendChild(li);
        });
        
        // Adiciona eventos aos botões de categoria
        document.querySelectorAll('.edit-category').forEach(btn => {
            btn.addEventListener('click', () => editCategory(parseInt(btn.dataset.index)));
        });
        
        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', () => deleteCategory(parseInt(btn.dataset.index)));
        });
    }

    function setupEventListeners() {
        // Filtros e busca
        categoryFilter.addEventListener('change', () => {
            loadProducts(categoryFilter.value, productSearch.value);
        });
        
        productSearch.addEventListener('input', () => {
            loadProducts(categoryFilter.value, productSearch.value);
        });
        
        // Botões principais
        addProductBtn.addEventListener('click', () => {
            openProductModal();
        });
        
        manageCategoriesBtn.addEventListener('click', () => {
            openCategoriesModal();
        });
        
        viewReportsBtn.addEventListener('click', () => {
            openReportsModal();
        });
        
        exportExcelBtn.addEventListener('click', exportToExcel);
        exportPdfBtn.addEventListener('click', exportToPdf);
        
        // Fechar modais
        document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // Formulários
        productForm.addEventListener('submit', handleProductSubmit);
        
        // Adicionar categoria
        document.getElementById('add-category-btn').addEventListener('click', addNewCategory);
        
        // Tabs de relatórios
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove a classe active de todas as tabs
                document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Adiciona a classe active à tab clicada
                tab.classList.add('active');
                const tabId = tab.dataset.tab + '-tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Funções de produtos
    function openProductModal(product = null) {
        isEditMode = product !== null;
        currentProductId = product ? product.id : null;
        
        const modalTitle = document.getElementById('modal-title');
        modalTitle.textContent = isEditMode ? `Editar ${product.name}` : 'Adicionar Novo Produto';
        
        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-description').value = product.description;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-code').value = product.code;
            
            // Limpar preview de imagens
            const imagePreview = document.getElementById('image-preview');
            imagePreview.innerHTML = '';
            
            // Adicionar imagens existentes ao preview
            product.images.forEach(image => {
                const img = document.createElement('img');
                img.src = `assets/${image}`;
                img.className = 'preview-image';
                imagePreview.appendChild(img);
            });
        } else {
            productForm.reset();
            document.getElementById('image-preview').innerHTML = '';
        }
        
        openModal(productModal);
    }

    function editProduct(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            openProductModal(product);
        }
    }

    function deleteProduct(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            products = products.filter(p => p.id !== id);
            loadProducts();
            showAlert('Produto excluído com sucesso!', 'success');
        }
    }

    function handleProductSubmit(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value,
            stock: parseInt(document.getElementById('product-stock').value),
            code: document.getElementById('product-code').value,
            images: [], // Será preenchido com o processamento das imagens
            status: 'active' // Status será calculado baseado no estoque
        };
        
        // Processar imagens (simplificado - em produção você faria upload real)
        const imageInput = document.getElementById('product-images');
        if (imageInput.files.length > 0) {
            for (let i = 0; i < imageInput.files.length; i++) {
                productData.images.push(imageInput.files[i].name);
            }
        } else if (isEditMode) {
            // Mantém as imagens existentes se não houver novas
            const existingProduct = products.find(p => p.id === currentProductId);
            if (existingProduct) {
                productData.images = existingProduct.images;
            }
        }
        
        // Determinar status baseado no estoque
        if (productData.stock <= 0) {
            productData.status = 'out';
        } else if (productData.stock <= 5) {
            productData.status = 'low';
        } else {
            productData.status = 'active';
        }
        
        if (isEditMode) {
            // Atualizar produto existente
            const index = products.findIndex(p => p.id === currentProductId);
            if (index !== -1) {
                productData.id = currentProductId;
                products[index] = productData;
                showAlert('Produto atualizado com sucesso!', 'success');
            }
        } else {
            // Adicionar novo produto
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            productData.id = newId;
            products.push(productData);
            showAlert('Produto adicionado com sucesso!', 'success');
        }
        
        loadProducts();
        closeAllModals();
    }

    // Funções de categorias
    function openCategoriesModal() {
        openModal(categoriesModal);
    }

    function addNewCategory() {
        const newCategoryInput = document.getElementById('new-category-name');
        const newCategory = newCategoryInput.value.trim();
        
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            loadCategories();
            newCategoryInput.value = '';
            showAlert('Categoria adicionada com sucesso!', 'success');
        } else if (categories.includes(newCategory)) {
            showAlert('Esta categoria já existe!', 'warning');
        } else {
            showAlert('Por favor, insira um nome válido para a categoria', 'warning');
        }
    }

    function editCategory(index) {
        const newName = prompt('Editar nome da categoria:', categories[index]);
        if (newName && newName.trim() !== '') {
            categories[index] = newName.trim();
            loadCategories();
            showAlert('Categoria atualizada com sucesso!', 'success');
        }
    }

    function deleteCategory(index) {
        if (confirm('Tem certeza que deseja excluir esta categoria? Produtos vinculados não serão excluídos.')) {
            categories.splice(index, 1);
            loadCategories();
            showAlert('Categoria excluída com sucesso!', 'success');
        }
    }

    // Funções de relatórios
    function openReportsModal() {
        // Carrega dados para os relatórios
        loadLowStockReport();
        loadTopProductsReport();
        loadRecentProductsReport();
        
        openModal(reportsModal);
    }

    function loadLowStockReport() {
        const lowStockBody = document.getElementById('low-stock-body');
        lowStockBody.innerHTML = '';
        
        const lowStockProducts = products.filter(p => p.stock <= 5);
        
        if (lowStockProducts.length === 0) {
            lowStockBody.innerHTML = '<tr><td colspan="4">Nenhum produto com estoque baixo</td></tr>';
            return;
        }
        
        lowStockProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td>5</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="editProduct(${product.id})">Repor</button>
                </td>
            `;
            lowStockBody.appendChild(row);
        });
    }

    function loadTopProductsReport() {
        const topProductsBody = document.getElementById('top-products-body');
        topProductsBody.innerHTML = '';
        
        // Simulando dados de vendas (em um sistema real, viria do banco de dados)
        const topProducts = [
            { name: "Sofá Capelinha 3 Lugares", sales: 42, revenue: 79795.80, stock: 15 },
            { name: "Mesa de Jantar Retrátil", sales: 28, revenue: 22397.20, stock: 8 },
            { name: "Cama Box Queen Size", sales: 19, revenue: 30398.10, stock: 0 }
        ];
        
        topProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.sales}</td>
                <td>R$ ${product.revenue.toFixed(2)}</td>
                <td>${product.stock}</td>
            `;
            topProductsBody.appendChild(row);
        });
    }

    function loadRecentProductsReport() {
        const recentProductsBody = document.getElementById('recent-products-body');
        recentProductsBody.innerHTML = '';
        
        // Ordena produtos por ID (simulando data de cadastro)
        const recentProducts = [...products]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);
        
        recentProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>${product.category}</td>
                <td>R$ ${product.price.toFixed(2)}</td>
            `;
            recentProductsBody.appendChild(row);
        });
    }

    // Funções de exportação
    function exportToExcel() {
        showAlert('Exportação para Excel iniciada!', 'info');
        // Em produção, você usaria uma biblioteca como SheetJS
    }

    function exportToPdf() {
        showAlert('Exportação para PDF iniciada!', 'info');
        // Em produção, você usaria uma biblioteca como jsPDF
    }

    // Funções auxiliares
    function openModal(modal) {
        closeAllModals();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 500);
        }, 3000);
    }

    // Prevenir fechamento do modal ao clicar dentro
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', e => e.stopPropagation());
    });

    // Fechar modal ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', closeAllModals);
    });

    // Preview de imagens
    document.getElementById('product-images').addEventListener('change', function(e) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        
        for (const file of e.target.files) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'preview-image';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
});

// Adicionando funções globais para serem acessíveis no HTML
function editProduct(id) {
    window.dispatchEvent(new CustomEvent('editProduct', { detail: id }));
}

// Dispara o evento quando o DOM estiver carregado
window.addEventListener('DOMContentLoaded', () => {
    window.dispatchEvent(new Event('appLoaded'));
});