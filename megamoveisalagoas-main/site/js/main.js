document.addEventListener('DOMContentLoaded', function() {
    // Configurações
    const IMG_PADRAO = 'img/img produtos/padrao.png';
    const PLANILHA_PATH = 'planinha Produtos/produtos.xlsx'; // Caminho direto
    
    // Elementos do DOM
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    // Menu Mobile
    mobileMenuBtn.addEventListener('click', () => nav.classList.toggle('active'));
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', () => nav.classList.remove('active'));
    });

    // Inicialização
    init();

    async function init() {
        showLoading(true);
        
        try {
            const produtos = await carregarProdutos();
            if (produtos.length === 0) throw new Error('Nenhum produto encontrado');
            
            renderizarPagina(produtos);
        } catch (error) {
            console.error('Erro:', error);
            const produtos = dadosExemplo();
            renderizarPagina(produtos);
        } finally {
            showLoading(false);
        }
    }

    async function carregarProdutos() {
        try {
            const response = await fetch(PLANILHA_PATH);
            if (!response.ok) throw new Error('Erro ao carregar planilha');
            
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            return jsonData.map((row, index) => ({
                id: row['ID'] || index + 1,
                nome: row['Nome'] || `Produto ${index + 1}`,
                categoria: row['Categoria'] || 'Sem Categoria',
                preco: parseFloat(row['Preço']) || 0,
                promocao: row['Promoção'] === 'Sim', // Agora usando "Sim"/"Não"
                precoPromocao: parseFloat(row['Preço Promo']) || 0,
                estoque: parseInt(row['Estoque']) || 0,
                descricao: row['Descrição Resumida'] || '',
                imagens: [row['Caminho Imagem'] || IMG_PADRAO]
            }));
        } catch (error) {
            console.error('Erro no carregamento:', error);
            return [];
        }
    }

    function dadosExemplo() {
        return [
            {
                id: 1,
                nome: "Sofá 3 Lugares Retrátil",
                categoria: "Sala de Estar",
                preco: 2499.9,
                promocao: true,
                precoPromocao: 1999.9,
                estoque: 5,
                descricao: "Sofá retrátil em couro sintético",
                imagens: [IMG_PADRAO]
            },
            {
                id: 2,
                nome: "Cama Queen Size",
                categoria: "Quarto",
                preco: 1899,
                promocao: true,
                precoPromocao: 1599,
                estoque: 3,
                descricao: "Cama com colchão ortopédico",
                imagens: [IMG_PADRAO]
            }
        ];
    }

    function renderizarPagina(produtos) {
        carregarPromocoes(produtos);
        carregarCategorias(produtos);
        carregarDestaques(produtos);
        configurarCarrossel();
    }

    function carregarPromocoes(produtos) {
        const carouselTrack = document.getElementById('carousel-track');
        carouselTrack.innerHTML = '';
        
        // Filtra produtos em promoção
        const promocoes = produtos.filter(p => p.promocao && p.estoque > 0);
        
        if (promocoes.length === 0) {
            carouselTrack.innerHTML = `
                <div class="sem-promocoes">
                    <i class="fas fa-tag"></i>
                    <p>Nenhuma promoção no momento</p>
                </div>
            `;

            // ADICIONE AQUI O CÓDIGO DE ESTILO
            const style = document.createElement('style');
            style.textContent = `
                .sem-promocoes {
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                    width: 100%;
                }
                .sem-promocoes i {
                    font-size: 3rem;
                    color: #ccc;
                    margin-bottom: 1rem;
                }
                .sem-promocoes p {
                    font-size: 1.2rem;
                }
            `;
            document.head.appendChild(style);
            
            return;
        }
        
        // Restante do código do carrossel...
        promocoes.forEach(produto => {
            const desconto = Math.round(((produto.preco - produto.precoPromocao) / produto.preco) * 100);
            
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <img src="${produto.imagens[0]}" alt="${produto.nome}" onerror="this.src='${IMG_PADRAO}'">
                <div class="product-info">
                    <h3>${produto.nome}</h3>
                    <div class="price-container">
                        <span class="current-price">R$ ${produto.precoPromocao.toFixed(2)}</span>
                        <span class="old-price">R$ ${produto.preco.toFixed(2)}</span>
                        <span class="discount-badge">-${desconto}%</span>
                    </div>
                    <a href="produto.html?id=${produto.id}" class="btn">Ver Detalhes</a>
                </div>
            `;
            carouselTrack.appendChild(slide);
        });
    }

    function carregarCategorias(produtos) {
        const categoryGrid = document.querySelector('.category-grid');
        categoryGrid.innerHTML = '';
        
        // Extrair categorias únicas dos produtos
        const categorias = [...new Set(produtos.map(p => p.categoria))].slice(0, 4);
        
        // Fallback caso não tenha categorias
        if (categorias.length === 0) {
            categorias.push('Sala de Estar', 'Quarto', 'Cozinha', 'Escritório');
        }
        
        categorias.forEach((cat, index) => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="img/img categorias/categoria${index + 1}.png" alt="${cat}" onerror="this.src='${IMG_PADRAO}'">
                <h3>${cat}</h3>
            `;
            card.addEventListener('click', () => {
                // Implemente a navegação para a categoria
                console.log(`Categoria selecionada: ${cat}`);
            });
            categoryGrid.appendChild(card);
        });
    }

    function carregarDestaques(produtos) {
        const productGrid = document.querySelector('.product-grid');
        productGrid.innerHTML = '';
        
        const destaques = produtos.filter(p => p.estoque > 0).slice(0, 8);
        
        if (destaques.length === 0) {
            productGrid.innerHTML = '<div class="sem-produtos">Nenhum produto em destaque</div>';
            return;
        }
        
        destaques.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${produto.imagens[0]}" alt="${produto.nome}" onerror="this.src='${IMG_PADRAO}'">
                <div class="product-info">
                    <h3>${produto.nome}</h3>
                    <span class="price">R$ ${produto.promocao ? produto.precoPromocao.toFixed(2) : produto.preco.toFixed(2)}</span>
                    <a href="produto.html?id=${produto.id}" class="btn">Ver Detalhes</a>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    function configurarCarrossel() {
        const track = document.getElementById('carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (slides.length === 0) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        
        let currentIndex = 0;
        const slideWidth = slides[0].offsetWidth;
        
        function atualizarPosicao() {
            track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        }
        
        function proximoSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            atualizarPosicao();
        }
        
        function slideAnterior() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            atualizarPosicao();
        }
        
        nextBtn.addEventListener('click', proximoSlide);
        prevBtn.addEventListener('click', slideAnterior);
        
        // Auto-scroll
        let intervalo = setInterval(proximoSlide, 5000);
        
        track.addEventListener('mouseenter', () => clearInterval(intervalo));
        track.addEventListener('mouseleave', () => {
            intervalo = setInterval(proximoSlide, 5000);
        });
    }

    function showLoading(show) {
        const loading = document.getElementById('loading');
        if (!loading) return;
        
        if (show) {
            loading.style.display = 'flex';
        } else {
            loading.style.display = 'none';
        }
    }

    // Página de produto
    if (window.location.pathname.includes('produto.html')) {
        carregarPaginaProduto();
    }

    async function carregarPaginaProduto() {
        showLoading(true);
        
        try {
            const productId = new URLSearchParams(window.location.search).get('id');
            if (!productId) throw new Error('ID do produto não especificado');
            
            const produtos = await carregarProdutos() || dadosExemplo();
            const produto = produtos.find(p => p.id == productId);
            
            if (!produto) throw new Error('Produto não encontrado');
            
            exibirDetalhesProduto(produto);
        } catch (error) {
            console.error('Erro ao carregar produto:', error);
            exibirErroProduto();
        } finally {
            showLoading(false);
        }
    }

    function exibirDetalhesProduto(produto) {
        const container = document.querySelector('.product-container');
        
        container.innerHTML = `
            <div class="product-gallery">
                <img src="${produto.imagens[0]}" alt="${produto.nome}" class="main-image" onerror="this.src='${IMG_PADRAO}'">
            </div>
            <div class="product-details">
                <h1>${produto.nome}</h1>
                <p class="category">${produto.categoria}</p>
                
                ${produto.promocao ? `
                    <div class="price">
                        <span class="old-price">R$ ${produto.preco.toFixed(2)}</span>
                        <span class="current-price">R$ ${produto.precoPromocao.toFixed(2)}</span>
                    </div>
                ` : `<div class="price">R$ ${produto.preco.toFixed(2)}</div>`}
                
                <p class="stock ${produto.estoque > 0 ? 'in-stock' : 'out-stock'}">
                    ${produto.estoque > 0 ? `Disponível (${produto.estoque} un)` : 'Esgotado'}
                </p>
                
                <div class="description">
                    <h3>Descrição</h3>
                    <p>${produto.descricao || 'Descrição não disponível'}</p>
                </div>
                
                <a href="https://wa.me/5582981062123?text=Olá, gostaria de saber sobre ${encodeURIComponent(produto.nome)} (ID: ${produto.id})" 
                   class="whatsapp-btn" target="_blank">
                    <i class="fab fa-whatsapp"></i> Comprar
                </a>
                
                <a href="index.html" class="back-btn">Voltar</a>
            </div>
        `;
    }

    function exibirErroProduto() {
        const container = document.querySelector('.product-container');
        container.innerHTML = `
            <div class="error-message">
                <h2>Produto não encontrado</h2>
                <p>O produto solicitado não está disponível.</p>
                <a href="index.html" class="btn">Voltar à loja</a>
            </div>
        `;
    }
});

// Modal de imagem global
function openImageModal(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <img src="${src}" alt="Zoom" onerror="this.src='img/img produtos/padrao.png'">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}