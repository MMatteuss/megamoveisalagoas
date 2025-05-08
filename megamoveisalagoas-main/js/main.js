document.addEventListener('DOMContentLoaded', function() {
    // Menu Mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
        });
    });
    
    // Carregar produtos do JSON
    fetch('json/produtos.json')
        .then(response => response.json())
        .then(data => {
            const produtos = data.produtos;
            
            // Carregar promoções no carrossel
            loadPromotions(produtos);
            
            // Carregar categorias
            loadCategories();
            
            // Carregar produtos em destaque
            loadFeaturedProducts(produtos);
            
            // Configurar eventos do carrossel
            setupCarousel();
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));
    
    // Função para carregar promoções no carrossel
    function loadPromotions(produtos) {
        const carouselTrack = document.getElementById('carousel-track');
        const promocoes = produtos.filter(produto => produto.promocao);
        
        promocoes.forEach(produto => {
            const discount = Math.round(((produto.preco - produto.precoPromocao) / produto.preco) * 100);
            
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.dataset.id = produto.id;
            
            slide.innerHTML = `
                <img src="images/produtos/${produto.imagens[0]}" alt="${produto.nome}">
                <div class="product-info">
                    <h3>${produto.nome}</h3>
                    <div class="price-container">
                        <span class="current-price">R$ ${produto.precoPromocao.toFixed(2)}</span>
                        <span class="old-price">R$ ${produto.preco.toFixed(2)}</span>
                        <span class="discount-badge">-${discount}% OFF</span>
                    </div>
                    <a href="produto.html?id=${produto.id}" class="btn">Ver Detalhes</a>
                </div>
            `;
            
            carouselTrack.appendChild(slide);
        });
    
        // Configurar carrossel automático
        setupCarousel();
    }
    
    function setupCarousel() {
        const track = document.getElementById('carousel-track');
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (slides.length === 0) return;
        
        const slideWidth = slides[0].offsetWidth + 20; // Inclui o gap
        let currentIndex = 0;
        let autoScrollInterval;
        
        // Posicionar slides
        function updateCarousel() {
            track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
        }
        
        // Próximo slide
        function nextSlide() {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }
        
        // Slide anterior
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = slides.length - 1;
            }
            updateCarousel();
        }
        
        // Event listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);
        
        // Auto-scroll
        function startAutoScroll() {
            autoScrollInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }
        
        // Iniciar auto-scroll
        startAutoScroll();
        
        // Pausar ao interagir
        track.addEventListener('mouseenter', stopAutoScroll);
        track.addEventListener('mouseleave', startAutoScroll);
        prevBtn.addEventListener('mouseenter', stopAutoScroll);
        nextBtn.addEventListener('mouseenter', stopAutoScroll);
        prevBtn.addEventListener('mouseleave', startAutoScroll);
        nextBtn.addEventListener('mouseleave', startAutoScroll);
    }
    
    // Função para configurar o carrossel
    function setupCarousel() {
        const track = document.querySelector('.carousel-track');
        const slides = Array.from(document.querySelectorAll('.carousel-slide'));
        const nextBtn = document.querySelector('.carousel-btn.next');
        const prevBtn = document.querySelector('.carousel-btn.prev');
        
        const slideWidth = slides[0].getBoundingClientRect().width;
        let currentIndex = 0;
        
        // Posicionar slides
        slides.forEach((slide, index) => {
            slide.style.left = `${slideWidth * index}px`;
        });
        
        // Mover para o slide
        function moveToSlide(index) {
            track.style.transform = `translateX(-${slideWidth * index}px)`;
            currentIndex = index;
        }
        
        // Próximo slide
        nextBtn.addEventListener('click', function() {
            if (currentIndex < slides.length - 1) {
                moveToSlide(currentIndex + 1);
            } else {
                moveToSlide(0);
            }
        });
        
        // Slide anterior
        prevBtn.addEventListener('click', function() {
            if (currentIndex > 0) {
                moveToSlide(currentIndex - 1);
            } else {
                moveToSlide(slides.length - 1);
            }
        });
        
        // Auto-play
        let interval = setInterval(() => {
            if (currentIndex < slides.length - 1) {
                moveToSlide(currentIndex + 1);
            } else {
                moveToSlide(0);
            }
        }, 5000);
        
        // Pausar auto-play ao passar o mouse
        track.addEventListener('mouseenter', () => clearInterval(interval));
        track.addEventListener('mouseleave', () => {
            interval = setInterval(() => {
                if (currentIndex < slides.length - 1) {
                    moveToSlide(currentIndex + 1);
                } else {
                    moveToSlide(0);
                }
            }, 5000);
        });
    }
    
    // Função para carregar categorias
    function loadCategories() {
        const categories = [
            { name: 'Sala de Estar', image: 'sala-estar.jpg' },
            { name: 'Quarto', image: 'quarto.jpg' },
            { name: 'Sala de Jantar', image: 'sala-jantar.jpg' },
            { name: 'Escritório', image: 'escritorio.jpg' },
            { name: 'Cozinha', image: 'cozinha.jpg' },
            { name: 'Banheiro', image: 'banheiro.jpg' },
            { name: 'Infantil', image: 'infantil.jpg' },
            { name: 'Área Externa', image: 'area-externa.jpg' }
        ];
        
        const categoryGrid = document.querySelector('.category-grid');
        
        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            
            card.innerHTML = `
                <img src="images/categorias/${category.image}" alt="${category.name}">
                <h3>${category.name}</h3>
            `;
            
            card.addEventListener('click', function() {
                // Aqui você pode redirecionar para uma página de categoria ou filtrar produtos
                alert(`Categoria: ${category.name}`);
            });
            
            categoryGrid.appendChild(card);
        });
    }
    
    // Função para carregar produtos em destaque
    function loadFeaturedProducts(produtos) {
        const productGrid = document.querySelector('.product-grid');
        const destaques = produtos.slice(0, 8); // Pegar os primeiros 8 produtos como destaque
        
        destaques.forEach(produto => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.dataset.id = produto.id;
            
            card.innerHTML = `
                <img src="images/produtos/${produto.imagens[0]}" alt="${produto.nome}">
                <div class="product-info">
                    <h3>${produto.nome}</h3>
                    <span class="price">R$ ${produto.preco.toFixed(2)}</span>
                    <a href="produto.html?id=${produto.id}" class="btn">Ver Detalhes</a>
                </div>
            `;
            
            productGrid.appendChild(card);
        });
    }
    
    // Verificar se estamos na página de produto
    if (window.location.pathname.includes('produto.html')) {
        loadProductPage();
    }
    
    // Função para carregar a página de produto
    function loadProductPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId) {
            fetch('json/produtos.json')
                .then(response => response.json())
                .then(data => {
                    const produto = data.produtos.find(p => p.id == productId);
                    
                    if (produto) {
                        displayProductDetails(produto);
                    } else {
                        document.querySelector('.product-page').innerHTML = `
                            <div class="container">
                                <h2>Produto não encontrado</h2>
                                <p>O produto que você está procurando não foi encontrado.</p>
                                <a href="index.html" class="btn">Voltar à loja</a>
                            </div>
                        `;
                    }
                })
                .catch(error => console.error('Erro ao carregar produto:', error));
        } else {
            window.location.href = 'index.html';
        }
    }
    
    // Função para exibir detalhes do produto
    function displayProductDetails(produto) {
        const productContainer = document.querySelector('.product-container');
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        
        // Criar galeria de imagens
        let galleryHTML = '';
        produto.imagens.forEach((img, index) => {
            if (index === 0) {
                galleryHTML += `<img src="images/produtos/${img}" alt="${produto.nome}" class="main-image" onclick="openImageModal('images/produtos/${img}')">`;
            } else {
                galleryHTML += `<img src="images/produtos/${img}" alt="${produto.nome}" onclick="openImageModal('images/produtos/${img}')">`;
            }
        });
        
        // Verificar estoque
        let stockHTML = '';
        let buttonHTML = '';
        
        if (produto.estoque > 0) {
            stockHTML = `<p class="stock in-stock">Em estoque: ${produto.estoque} unidades</p>`;
            buttonHTML = `<a href="https://wa.me/5588888888?text=Olá, estou interessado no produto ${produto.nome} (Código: ${produto.id})" class="btn whatsapp-btn" target="_blank"><i class="fab fa-whatsapp"></i> Entrar em contato</a>`;
        } else {
            stockHTML = `<p class="stock out-of-stock">Produto esgotado</p>`;
            buttonHTML = `<button class="btn notify-btn">Ver quando haverá mais</button>`;
        }
        
        // Preencher detalhes do produto
        productContainer.innerHTML = `
            <div class="product-gallery">
                ${galleryHTML}
            </div>
            <div class="product-details">
                <h1>${produto.nome}</h1>
                <p class="product-category">Categoria: ${produto.categoria}</p>
                <p class="product-price">R$ ${produto.preco.toFixed(2)}</p>
                ${stockHTML}
                <div class="product-description">
                    <h3>Descrição</h3>
                    <p>${produto.descricao}</p>
                </div>
                ${buttonHTML}
                <a href="index.html" class="btn back-btn">Voltar à loja</a>
            </div>
        `;
        
        // Configurar botão de notificação
        const notifyBtn = document.querySelector('.notify-btn');
        if (notifyBtn) {
            notifyBtn.addEventListener('click', function() {
                alert('Assim que tivermos mais unidades deste produto, entraremos em contato!');
            });
        }
    }
});

// Função para abrir modal de imagem (deve ser global)
function openImageModal(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${src}" alt="Imagem ampliada">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fechar modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Fechar ao clicar fora da imagem
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}