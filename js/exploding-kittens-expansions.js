document.addEventListener('DOMContentLoaded', function () {
    // Referencia al contenedor de expansiones
    const container = document.getElementById('expansions-list');
    Promise.all([
        fetch('data/exploding-kittens/expansions-config.json').then(res => res.json()),
        fetch('data/exploding-kittens/cards-config.json').then(res => res.json()),
        fetch('data/exploding-kittens/cat-cards-config.json').then(res => res.json())
    ]).then(([expansions, cardsConfig, catCards]) => {
        const cardIconMap = {};
        const cardDataMap = {};
        cardsConfig.forEach(card => {
            cardIconMap[card.id] = card.image;
            cardDataMap[card.id] = card;
        });
        // Añadir imágenes de cartas de gato específicas
        const catCardDataMap = {};
        catCards.forEach(cat => {
            cardIconMap[cat.id] = cat.image;
            catCardDataMap[cat.id] = cat;
        });
        // Guardar ids de cartas de gato
        const catCardIds = new Set(catCards.map(cat => cat.id));
        renderExpansions(expansions, cardIconMap, cardDataMap, container, catCardIds, catCardDataMap);
        setupModal();
    });
});

function setupModal() {
    // Reutiliza el modal de la página principal si existe, si no lo crea
    if (!document.getElementById('card-modal')) {
        const modalHtml = `
        <div id="card-modal" style="
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.75); /* Fondo más oscuro */
            align-items: center;
            justify-content: center;
            z-index: 1000;
        ">
            <div style="
                background: #fff; 
                border-radius: 12px; 
                padding: 1.5rem; /* Ajuste de padding */
                max-width: 400px; /* Un poco más ancho */
                width: 90%; 
                position: relative;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3); /* Sombra destacada */
                border: 1px solid #ddd; /* Borde sutil */
                animation: fadeIn 0.3s ease-out; /* Requiere el @keyframes fadeIn en el CSS */
            ">
                <button onclick="closeModal()" style="
                    position: absolute; 
                    top: 10px; right: 10px; 
                    background: #eee; 
                    border: none; 
                    border-radius: 50%; 
                    width: 32px; height: 32px; /* Botón más grande */
                    font-size: 1.2rem; 
                    cursor: pointer; 
                    color: #333;
                    transition: background 0.2s;
                ">&times;</button>
                
                <div style="text-align: center; padding-top: 10px;">
                    <img id="modal-img" src="" alt="" style="
                        width: 80px; 
                        height: 80px; 
                        object-fit: contain; 
                        margin: 0 auto 1rem auto; /* Centrar y margen inferior */
                        border-radius: 8px; /* Borde en la imagen */
                        background: #f8f8f8; /* Fondo sutil para la imagen */
                        padding: 5px;
                    " />
                    <h3 id="modal-title" style="
                        font-size: 1.6rem; 
                        font-weight: 700; 
                        color: #2c3e50; /* Color oscuro para el título */
                        margin-bottom: 0.5rem;
                    "></h3>
                    
                    <div id="modal-tags" style="
                        margin-bottom: 1rem;
                        font-size: 0.9em;
                        color: #666;
                    "></div>
                    
                    <p id="modal-desc" style="
                        color: #444;
                        text-align: left; /* Alineación a la izquierda para mejor lectura */
                        margin-bottom: 1rem;
                        line-height: 1.5;
                    "></p>
                    
                    <div id="modal-detail" style="
                        color: #2980b9; 
                        font-size: 0.95em; 
                        margin-top: 1.5rem;
                        padding: 10px;
                        background: #f0f7ff; /* Fondo azul claro para destacar la regla */
                        border-left: 4px solid #3498db; /* Borde para énfasis */
                        border-radius: 4px;
                        text-align: left;
                    "></div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    window.closeModal = function () {
        document.getElementById('card-modal').style.display = 'none';
    };
}

function renderExpansions(expansions, cardIconMap, cardDataMap, container, catCardIds, catCardDataMap) {
    container.innerHTML = '';
    expansions.forEach(exp => {
        const expDiv = document.createElement('div');
        expDiv.className = 'expansion';
        expDiv.innerHTML = `
            <div class="expansion-title">${exp.name}</div>
            <div class="expansion-desc">${exp.description}</div>
            ${exp.packs.map(pack => `
                <div class="pack-title" style="display:flex;align-items:center;gap:0.5em;">
                    ${pack.icon ? `<span style="width:32px;height:32px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:${pack.iconBg || '#eaeaea'};margin-right:0.2em;"><img src="${pack.icon}" alt="icono pack" style="width:22px;height:22px;object-fit:contain;border-radius:50%;"></span>` : ''}
                    <span>${pack.name}</span>
                </div>
                <div class="cards-grid">
                    ${pack.cards.map(card => `
                        <div class="card-icon p-1 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-blue-300 cursor-pointer" 
                             data-card-id="${card.id}">
                            <div class="flex flex-col items-center justify-start h-full p-1">
                                <img src="${cardIconMap[card.id] || ''}" alt="${card.id}" />
                                <div class="card-name w-full px-1">${card.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                <div class="card-count">x${card.count}</div>
                            </div>
                        </div>
                    `).join('')}
            </div>
            `).join('')}
        `;
        container.appendChild(expDiv);
    });
    // Añadir eventos para mostrar el modal al hacer click en una carta
    container.querySelectorAll('.card-icon[data-card-id]').forEach(el => {
        el.onclick = function () {
            const cardId = this.getAttribute('data-card-id');
            if (catCardIds && catCardIds.has(cardId)) {
                // Mostrar carta especial de gatos, pero con el icono y nombre de la carta seleccionada
                const catCard = cardDataMap['cat-card'];
                const selectedCat = catCardDataMap[cardId];
                if (catCard && selectedCat) {
                    // Clonar la info de catCard pero sobreescribir imagen y nombre
                    const cardToShow = Object.assign({}, catCard, {
                        image: selectedCat.image,
                        name: selectedCat.name
                    });
                    showCardInfo(cardToShow);
                }
                return;
            }
            const card = cardDataMap[cardId];
            if (card) showCardInfo(card);
        };
    });
}

// Las funciones showCardInfo y closeModal ahora están en js/exploding-kittens-functions.js
// Asegúrate de incluir <script src="js/exploding-kittens-functions.js"></script> antes de este script en el HTML