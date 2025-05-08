document.addEventListener('DOMContentLoaded', function() {
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
    let products = [];
    let categories = [];

    // Adicione esta variável no início com as outras declarações
    const statusFilter = document.getElementById('status-filter');

    // URL do arquivo JSON
    const JSON_URL = 'json/produtos.json';

    // Inicialização
    fetchProducts();
    setupEventListeners();

    // Função para carregar produtos do JSON
    async function fetchProducts() {
        try {
            const response = await fetch(JSON_URL);
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos');
            }
            const data = await response.json();
            products = data.produtos;
            
            // Extrair categorias únicas dos produtos
            const uniqueCategories = new Set(products.map(p => p.categoria));
            categories = Array.from(uniqueCategories);
            
            loadProducts();
            loadCategories();
        } catch (error) {
            console.error('Erro:', error);
            showAlert('Erro ao carregar produtos do servidor', 'error');
        }
    }

    // Função para salvar produtos no JSON (simulado - em produção seria uma chamada API)
    async function saveProducts() {
        try {
            // Em um ambiente real, você faria uma chamada fetch para um endpoint de API
            // que atualizaria o arquivo JSON no servidor
            // Aqui estamos apenas simulando o comportamento
            
            // Atualizar categorias únicas
            const uniqueCategories = new Set(products.map(p => p.categoria));
            categories = Array.from(uniqueCategories);
            
            loadCategories();
            showAlert('Produtos atualizados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar produtos:', error);
            showAlert('Erro ao salvar produtos', 'error');
        }
    }

    // Funções principais
    function loadProducts(filterCategory = '', searchTerm = '', filterStatus = '') {
        productsTableBody.innerHTML = '';
        
        const filteredProducts = products.filter(product => {
            const matchesCategory = filterCategory === '' || product.categoria === filterCategory;
            const matchesSearch = searchTerm === '' || 
                product.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                product.id.toString().includes(searchTerm.toLowerCase());
            
            // Adicione a verificação do status
            let matchesStatus = true;
            if (filterStatus !== '') {
                const productStatus = getProductStatus(product);
                matchesStatus = productStatus === filterStatus;
            }
            
            return matchesCategory && matchesSearch && matchesStatus;
        });
        
        // Restante da função permanece igual
        if (filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="text-center">Nenhum produto encontrado</td>`;
            productsTableBody.appendChild(row);
            return;
        }
        
        filteredProducts.forEach(product => {
            const status = getProductStatus(product);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="assets/${product.imagens[0] || 'placeholder.jpg'}" alt="${product.nome}" class="product-image"></td>
                <td>${product.nome}</td>
                <td>${product.categoria}</td>
                <td>${product.promocao ? `<span class="old-price">R$ ${product.preco.toFixed(2)}</span> R$ ${product.precoPromocao.toFixed(2)}` : `R$ ${product.preco.toFixed(2)}`}</td>
                <td>${product.estoque}</td>
                <td><span class="status-badge status-${status}">${
                    status === 'active' ? 'Disponível' : 
                    status === 'low' ? 'Estoque Baixo' : 'Esgotado'
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

    function getProductStatus(product) {
        if (product.estoque <= 0) {
            return 'out';
        } else if (product.estoque <= 5) {
            return 'low';
        } else {
            return 'active';
        }
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
        statusFilter.addEventListener('change', () => {
            loadProducts(categoryFilter.value, productSearch.value, statusFilter.value);
        });
        
        // Certifique-se de que os outros filtros também considerem o status
        categoryFilter.addEventListener('change', () => {
            loadProducts(categoryFilter.value, productSearch.value, statusFilter.value);
        });
        
        productSearch.addEventListener('input', () => {
            loadProducts(categoryFilter.value, productSearch.value, statusFilter.value);
        });
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
        modalTitle.textContent = isEditMode ? `Editar ${product.nome}` : 'Adicionar Novo Produto';
        
        if (product) {
            document.getElementById('product-name').value = product.nome;
            document.getElementById('product-category').value = product.categoria;
            document.getElementById('product-price').value = product.preco;
            document.getElementById('product-description').value = product.descricao;
            document.getElementById('product-stock').value = product.estoque;
            document.getElementById('product-code').value = product.id;
            
            // Limpar preview de imagens
            const imagePreview = document.getElementById('image-preview');
            imagePreview.innerHTML = '';
            
            // Adicionar imagens existentes ao preview
            product.imagens.forEach(image => {
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
            saveProducts();
            loadProducts();
            showAlert('Produto excluído com sucesso!', 'success');
        }
    }

    function handleProductSubmit(e) {
        e.preventDefault();
        
        const productData = {
            nome: document.getElementById('product-name').value,
            categoria: document.getElementById('product-category').value,
            preco: parseFloat(document.getElementById('product-price').value),
            descricao: document.getElementById('product-description').value,
            estoque: parseInt(document.getElementById('product-stock').value),
            promocao: false,
            precoPromocao: 0,
            imagens: [], // Será preenchido com o processamento das imagens
        };
        
        // Processar imagens (simplificado - em produção você faria upload real)
        const imageInput = document.getElementById('product-images');
        if (imageInput.files.length > 0) {
            for (let i = 0; i < imageInput.files.length; i++) {
                productData.imagens.push(imageInput.files[i].name);
            }
        } else if (isEditMode) {
            // Mantém as imagens existentes se não houver novas
            const existingProduct = products.find(p => p.id === currentProductId);
            if (existingProduct) {
                productData.imagens = existingProduct.imagens;
                productData.promocao = existingProduct.promocao || false;
                productData.precoPromocao = existingProduct.precoPromocao || 0;
            }
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
        
        saveProducts();
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
            
            // Atualizar a categoria em todos os produtos
            products.forEach(product => {
                if (product.categoria === categories[index]) {
                    product.categoria = newName.trim();
                }
            });
            
            saveProducts();
            loadCategories();
            showAlert('Categoria atualizada com sucesso!', 'success');
        }
    }

    function deleteCategory(index) {
        if (confirm('Tem certeza que deseja excluir esta categoria? Produtos vinculados não serão excluídos.')) {
            categories.splice(index, 1);
            saveProducts();
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
        
        const lowStockProducts = products.filter(p => p.estoque <= 5);
        
        if (lowStockProducts.length === 0) {
            lowStockBody.innerHTML = '<tr><td colspan="4">Nenhum produto com estoque baixo</td></tr>';
            return;
        }
        
        lowStockProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.nome}</td>
                <td>${product.estoque}</td>
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
        const topProducts = products
            .map(p => ({
                nome: p.nome,
                vendas: Math.floor(Math.random() * 50), // Simula vendas aleatórias
                receita: (Math.floor(Math.random() * 50) * p.preco), // Simula receita
                estoque: p.estoque
            }))
            .sort((a, b) => b.vendas - a.vendas)
            .slice(0, 5);
        
        topProducts.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.nome}</td>
                <td>${product.vendas}</td>
                <td>R$ ${product.receita.toFixed(2)}</td>
                <td>${product.estoque}</td>
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
                <td>${product.nome}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>${product.categoria}</td>
                <td>${product.promocao ? `R$ ${product.precoPromocao.toFixed(2)}` : `R$ ${product.preco.toFixed(2)}`}</td>
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

// Função global para edição de produtos
function editProduct(id) {
    document.dispatchEvent(new CustomEvent('editProduct', { detail: id }));
}