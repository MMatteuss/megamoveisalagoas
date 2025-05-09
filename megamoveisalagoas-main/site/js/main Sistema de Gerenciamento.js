document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const productsTableBody = document.querySelector('#products-table tbody');
    const categoryFilter = document.getElementById('category-filter');
    const productSearch = document.getElementById('product-search');
    const statusFilter = document.getElementById('status-filter');
    const addProductBtn = document.getElementById('add-product');
    const exportExcelBtn = document.getElementById('export-excel');
    const exportPdfBtn = document.getElementById('export-pdf');
    
    // Modais e formulários
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    
    // Variáveis de estado
    let products = [];
    let categories = [];
    let currentProductId = null;
    let isEditMode = false;
    
    // Caminho para a planilha
    const PLANILHA_PATH = 'planinha Produtos/produtos.xlsx';

    // Inicialização
    fetchProducts();

    // Função principal para carregar produtos da planilha
        async function fetchProducts() {
        try {
            const response = await fetch(PLANILHA_PATH);
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Pega a primeira planilha
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Converte para JSON (incluindo cabeçalhos)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Remove a primeira linha (cabeçalhos)
            const rows = jsonData.slice(1);
            
            // Processa cada linha da planilha
            // Dentro da função fetchProducts(), modifique o mapeamento dos produtos:
            products = rows.map((row, index) => {
                // Garante que todas as colunas existam
                const safeRow = Array.isArray(row) ? row : [];
                
                return {
                    id: parseInt(safeRow[0]) || index + 1, // Coluna A ou índice + 1
                    nome: safeRow[1] || `Produto ${index + 1}`, // Coluna B
                    categoria: safeRow[2] || 'Sem Categoria', // Coluna C
                    preco: parseFloat(safeRow[3]) || 0, // Coluna D
                    promocao: safeRow[4] === 'TRUE', // Coluna E (TRUE/FALSE)
                    precoPromocao: parseFloat(safeRow[5]) || 0, // Coluna F
                    estoque: parseInt(safeRow[6]) || 0, // Coluna G
                    descricao: safeRow[7] || '', // Coluna H
                    imagens: safeRow[8] ? [safeRow[8]] : [`produto_${index + 1}.jpg`] // Coluna I - Caminho da Imagem
                };
            }).filter(product => product.nome); // Remove linhas vazias
            
            // Extrai categorias únicas
            categories = [...new Set(products.map(p => p.categoria))];
            
            loadProducts();
            loadCategories();
            showAlert('Produtos carregados com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao carregar planilha:', error);
            showAlert('Erro ao carregar produtos da planilha. Verifique o formato do arquivo.', 'error');
            
            // Carrega dados de exemplo em caso de erro
            loadSampleData();
        }
    }

    // Função para salvar produtos na planilha (faz download do arquivo atualizado)
    async function saveProducts() {
        try {
            // Reorganiza os IDs sequencialmente
            products = products.map((product, index) => ({
                ...product,
                id: index + 1
            }));
            
            // Prepara os dados para a planilha
            const planilhaData = products.map(product => ({
                'ID': product.id,
                'Nome': product.nome,
                'Categoria': product.categoria,
                'Preço': product.preco,
                'Promoção': product.promocao ? 'Sim' : 'Não',
                'Preço Promo': product.promocao ? product.precoPromocao : '',
                'Estoque': product.estoque,
                'Descrição Resumida': product.descricao
            }));
            
            // Cria nova planilha
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(planilhaData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
            
            // Gera arquivo e faz download
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'produtos_atualizados.xlsx';
            a.click();
            URL.revokeObjectURL(url);
            
            showAlert('Planilha atualizada com sucesso! Faça o download do arquivo.', 'success');
        } catch (error) {
            console.error('Erro ao salvar planilha:', error);
            showAlert('Erro ao salvar planilha', 'error');
        }
    }

    // Carrega produtos na tabela com filtros
    function loadProducts(filterCategory = '', searchTerm = '', filterStatus = '') {
        productsTableBody.innerHTML = '';
        
        const filteredProducts = products.filter(product => {
            const matchesCategory = !filterCategory || product.categoria === filterCategory;
            const matchesSearch = !searchTerm || 
                product.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                product.id.toString().includes(searchTerm);
            const matchesStatus = !filterStatus || getProductStatus(product) === filterStatus;
            
            return matchesCategory && matchesSearch && matchesStatus;
        });
        
        if (filteredProducts.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum produto encontrado</td></tr>';
            return;
        }
        
        filteredProducts.forEach(product => {
            const status = getProductStatus(product);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td><img src="${product.imagens[0] || 'assets/placeholder.jpg'}" alt="${product.nome}" class="product-image"></td>
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
        
        // Adiciona eventos aos botões
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.id)));
        });
    }

    // Determina o status do produto baseado no estoque
    function getProductStatus(product) {
        if (product.estoque <= 0) return 'out';
        if (product.estoque <= 5) return 'low';
        return 'active';
    }

    // Carrega categorias nos filtros
    function loadCategories() {
        // Filtro de categoria
        categoryFilter.innerHTML = '<option value="">Todas categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        
        // Formulário de produto
        const productCategorySelect = document.getElementById('product-category');
        productCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            productCategorySelect.appendChild(option);
        });
    }

    // Configura os event listeners
    function setupEventListeners() {
        // Filtros
        categoryFilter.addEventListener('change', () => {
            loadProducts(categoryFilter.value, productSearch.value, statusFilter.value);
        });
        
        productSearch.addEventListener('input', () => {
            loadProducts(categoryFilter.value, productSearch.value, statusFilter.value);
        });
        
        statusFilter.addEventListener('change', () => {
            loadProducts(categoryFilter.value, productSearch.value, statusFilter.value);
        });
        
        // Botões principais
        addProductBtn.addEventListener('click', openProductModal);
        exportExcelBtn.addEventListener('click', exportToExcel);
        exportPdfBtn.addEventListener('click', exportToPdf);
        
        // Fechar modais
        document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // Formulário de produto
        productForm.addEventListener('submit', handleProductSubmit);
        
        // Preview de imagens
        document.getElementById('product-images').addEventListener('change', function(e) {
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '';
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = event => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-image';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Funções para produtos
    function openProductModal(product = null) {
        isEditMode = product !== null;
        currentProductId = product?.id || null;
        
        document.getElementById('modal-title').textContent = isEditMode ? `Editar ${product.nome}` : 'Novo Produto';
        
        if (product) {
            document.getElementById('product-name').value = product.nome;
            document.getElementById('product-category').value = product.categoria;
            document.getElementById('product-price').value = product.preco;
            document.getElementById('product-description').value = product.descricao;
            document.getElementById('product-stock').value = product.estoque;
            document.getElementById('product-code').value = product.id;
            
            const imagePreview = document.getElementById('image-preview');
            imagePreview.innerHTML = '';
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
        if (product) openProductModal(product);
    }

    async function deleteProduct(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            products = products.filter(p => p.id !== id);
            await saveProducts();
            loadProducts();
            showAlert('Produto excluído com sucesso!', 'success');
        }
    }

    async function handleProductSubmit(e) {
        e.preventDefault();
        
        try {
            const productData = {
                nome: document.getElementById('product-name').value,
                categoria: document.getElementById('product-category').value,
                preco: parseFloat(document.getElementById('product-price').value),
                descricao: document.getElementById('product-description').value,
                estoque: parseInt(document.getElementById('product-stock').value),
                promocao: false,
                precoPromocao: 0,
                imagens: []
            };
            
            // Processa imagens
            const imageInput = document.getElementById('product-images');
            if (imageInput.files.length > 0) {
                productData.imagens = Array.from(imageInput.files).map(file => file.name);
            } else if (isEditMode) {
                const existing = products.find(p => p.id === currentProductId);
                if (existing) {
                    productData.imagens = existing.imagens;
                    productData.promocao = existing.promocao;
                    productData.precoPromocao = existing.precoPromocao;
                }
            }
            
            if (isEditMode) {
                const index = products.findIndex(p => p.id === currentProductId);
                if (index !== -1) {
                    productData.id = currentProductId;
                    products[index] = productData;
                    showAlert('Produto atualizado!', 'success');
                }
            } else {
                productData.id = Math.max(0, ...products.map(p => p.id)) + 1;
                products.push(productData);
                showAlert('Produto adicionado!', 'success');
            }
            
            await saveProducts();
            loadProducts();
            closeAllModals();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            showAlert('Erro ao salvar produto', 'error');
        }
    }

    // Funções de exportação
    async function exportToExcel() {
        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(products.map(p => ({
                'ID': p.id,
                'Nome': p.nome,
                'Categoria': p.categoria,
                'Preço': p.preco,
                'Promoção': p.promocao ? 'Sim' : 'Não',
                'Preço Promo': p.promocao ? p.precoPromocao : '',
                'Estoque': p.estoque,
                'Status': getProductStatus(p) === 'active' ? 'Disponível' : 
                         getProductStatus(p) === 'low' ? 'Estoque Baixo' : 'Esgotado',
                'Descrição': p.descricao
            })));
            
            XLSX.utils.book_append_sheet(wb, ws, "Produtos");
            XLSX.writeFile(wb, `relatorio_produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
            showAlert('Exportação para Excel concluída!', 'success');
        } catch (error) {
            console.error('Erro ao exportar para Excel:', error);
            showAlert('Erro ao exportar para Excel', 'error');
        }
    }

    async function exportToPdf() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(18);
            doc.text('Relatório de Produtos', 14, 22);
            doc.setFontSize(12);
            doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
            
            doc.autoTable({
                head: [['ID', 'Nome', 'Categoria', 'Preço', 'Estoque', 'Status']],
                body: products.map(p => [
                    p.id,
                    p.nome,
                    p.categoria,
                    `R$ ${p.preco.toFixed(2)}`,
                    p.estoque,
                    getProductStatus(p) === 'active' ? 'Disponível' : 
                    getProductStatus(p) === 'low' ? 'Estoque Baixo' : 'Esgotado'
                ]),
                startY: 40,
                styles: { fontSize: 8, cellPadding: 2 }
            });
            
            doc.save(`relatorio_produtos_${new Date().toISOString().split('T')[0]}.pdf`);
            showAlert('Exportação para PDF concluída!', 'success');
        } catch (error) {
            console.error('Erro ao exportar para PDF:', error);
            showAlert('Erro ao exportar para PDF', 'error');
        }
    }

    // Funções auxiliares
    function openModal(modal) {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        document.body.style.overflow = 'auto';
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    // Inicializa os listeners
    setupEventListeners();
});

// Função global para edição
function editProduct(id) {
    document.dispatchEvent(new CustomEvent('editProduct', { detail: id }));
}