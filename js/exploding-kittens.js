document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('card-icons-grid');
    if (!grid) return;
    fetch('data/exploding-kittens/cards-config.json')
        .then(res => res.json())
        .then(cards => {
            grid.innerHTML = '';
            cards.filter(card => card.show !== false).forEach(card => {
                const div = document.createElement('div');
                
                // Mantenemos el estilo de la tarjeta
                div.className = 'card-icon p-2 bg-white rounded-lg shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg hover:border-blue-300 cursor-pointer';
                
                div.innerHTML = `
                    <div class="flex flex-col items-center justify-start h-full">
                        <img src="${card.image}" alt="${card.name}" title="${card.name}" 
                             class="w-20 h-20 object-contain mb-1" /> 
                        <span class="text-xs font-medium text-gray-700 mt-1 truncate w-full px-1 text-center">${card.name}</span>
                    </div>
                `;
                
                div.onclick = () => showCardInfo(card);
                grid.appendChild(div);
            });
        });
});

// Las funciones showCardInfo y closeModal ahora están en js/exploding-kittens-functions.js
// Asegúrate de incluir <script src="js/exploding-kittens-functions.js"></script> antes de este script en el HTML
