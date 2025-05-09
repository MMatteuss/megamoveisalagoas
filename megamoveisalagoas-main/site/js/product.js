document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const nav = document.getElementById('main-nav');
    const header = document.getElementById('main-header');
    const productContainer = document.getElementById('product-container');
    const relatedProductsGrid = document.getElementById('related-products-grid');
    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.querySelector('.close-modal');
    
    // Menu Mobile
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        mobileMenuBtn.innerHTML = nav.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Efeito de scroll no header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });
    
    // Carregar produto do JSON baseado no ID da URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        fetch('data/produtos.json')
            .then(response => response.json())
            .then(data => {
                const produto = data.produtos.find(p => p.id == productId);
                
                if (produto) {
                    displayProductDetails(produto);
                    loadRelatedProducts(data.produtos, produto.categoria, produto.id);
                } else {
                    showProductNotFound();
                }
            })
            .catch(error => {
                console.error('Erro ao carregar produto:', error);
                showProductNotFound();
            });
    } else {
        showProductNotFound();
    }
    
    // Função para exibir detalhes do produto
    function displayProductDetails(produto) {
        // Atualizar breadcrumb
        document.getElementById('product-category-breadcrumb').textContent = produto.categoria;
        document.getElementById('product-name-breadcrumb').textContent = produto.nome;
        
        // Calcular desconto se houver promoção
        let priceHTML = '';
        if (produto.promocao) {
            const discount = Math.round(((produto.preco - produto.precoPromocao) / produto.preco) * 100);
            priceHTML = `
                <span class="product-price">R$ ${produto.precoPromocao.toFixed(2)}</span>
                <span class="product-old-price">R$ ${produto.preco.toFixed(2)}</span>
                <span class="discount-tag">-${discount}%</span>
            `;
        } else {
            priceHTML = `<span class="product-price">R$ ${produto.preco.toFixed(2)}</span>`;
        }
        
        // Verificar estoque
        let stockHTML = '';
        let buttonHTML = '';
        
        if (produto.estoque > 0) {
            stockHTML = `
                <div class="stock-info in-stock">
                    <i class="fas fa-check-circle"></i>
                    Em estoque: ${produto.estoque} unidades
                </div>
            `;
            buttonHTML = `
                <a href="https://wa.me/5582981062123?text=Olá, estou interessado no produto ${encodeURIComponent(produto.nome)} (Código: ${produto.id})" 
                   class="whatsapp-btn" target="_blank">
                    <i class="fab fa-whatsapp"></i> Entrar em contato
                </a>
            `;
        } else {
            stockHTML = `
                <div class="stock-info out-of-stock">
                    <i class="fas fa-times-circle"></i>
                    Produto esgotado
                </div>
            `;
            buttonHTML = `
                <button class="notify-btn" id="notify-btn">
                    <i class="fas fa-bell"></i> Avise-me quando chegar
                </button>
            `;
        }
        
        // Criar galeria de imagens
        let galleryHTML = '';
        produto.imagens.forEach((img, index) => {
            if (index === 0) {
                galleryHTML += `
                    <img src="images/produtos/${img}" alt="${produto.nome}" 
                         class="main-image" onclick="openImageModal('images/produtos/${img}')">
                `;
            } else {
                galleryHTML += `
                    <img src="images/produtos/${img}" alt="${produto.nome}" 
                         class="thumbnail" onclick="openImageModal('images/produtos/${img}')">
                `;
            }
        });
        
        // Preencher detalhes do produto
        productContainer.innerHTML = `
            <div class="product-gallery">
                ${galleryHTML}
            </div>
            <div class="product-details">
                <h1 class="product-title">${produto.nome}</h1>
                <span class="product-category">${produto.categoria}</span>
                
                ${priceHTML}
                ${stockHTML}
                
                <div class="product-description">
                    <h3>Descrição</h3>
                    <p>${produto.descricao}</p>
                </div>
                
                <div class="product-actions">
                    ${buttonHTML}
                </div>
                
                <a href="index.html" class="btn back-btn">
                    <i class="fas fa-arrow-left"></i> Voltar à loja
                </a>
            </div>
        `;
        
        // Configurar botão de notificação
        const notifyBtn = document.getElementById('notify-btn');
        if (notifyBtn) {
            notifyBtn.addEventListener('click', function() {
                const email = prompt('Por favor, digite seu e-mail para ser avisado quando este produto estiver disponível:');
                if (email) {
                    alert(`Obrigado! Vamos te avisar no e-mail ${email} quando o produto "${produto.nome}" estiver disponível.`);
                }
            });
        }
    }
    
    // Função para carregar produtos relacionados
    function loadRelatedProducts(produtos, categoria, currentProductId) {
        const relacionados = produtos.filter(p => 
            p.categoria === categoria && p.id != currentProductId
        ).slice(0, 4); // Limitar a 4 produtos
        
        if (relacionados.length === 0) {
            document.querySelector('.related-products').style.display = 'none';
            return;
        }
        
        relacionados.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = produto.id;
            
            // Verificar se é promoção
            const badge = produto.promocao ? 
                `<span class="product-badge">Promoção</span>` : '';
            
            card.innerHTML = `
                ${badge}
                <img src="images/produtos/${produto.imagens[0]}" alt="${produto.nome}">
                <div class="product-info-featured">
                    <h3>${produto.nome}</h3>
                    <span class="price">R$ ${produto.preco.toFixed(2)}</span>
                    <a href="produto.html?id=${produto.id}" class="btn">Ver Detalhes</a>
                </div>
            `;
            
            relatedProductsGrid.appendChild(card);
        });
    }
    
    // Função para mostrar mensagem de produto não encontrado
    function showProductNotFound() {
        productContainer.innerHTML = `
            <div class="product-not-found">
                <h2>Produto não encontrado</h2>
                <p>O produto que você está procurando não foi encontrado em nosso catálogo.</p>
                <a href="index.html" class="btn">Voltar à loja</a>
            </div>
        `;
        document.querySelector('.related-products').style.display = 'none';
    }
});

// Função global para abrir modal de imagem
function openImageModal(src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    
    modalImg.src = src;
    modal.classList.add('active');
    
    // Fechar modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        modal.classList.remove('active');
    });
    
    // Fechar ao clicar fora da imagem
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
        }
    });
}