document.addEventListener('DOMContentLoaded', function() {
    fetchCards();

    document.getElementById('filter').addEventListener('change', fetchCards);
});

function fetchCards() {
    fetch('http://localhost:3000/cards')
        .then(response => response.json())
        .then(data => displayCards(data));
}

function displayCards(cards) {
    const cardContainer = document.getElementById('cards');
    cardContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.innerHTML = `
            <h2>${card.name}</h2>
            <p>Release Year: ${card.release_year}</p>
            <p>Cost: ${card.cost}</p>
            <p>Type: ${card.type}</p>
            <p>Subtype: ${card.subtype}</p>
            <p>Ability: ${card.ability}</p>
            <p>Power: ${card.power}</p>
            <p>Toughness: ${card.toughness}</p>
        `;
        cardContainer.appendChild(cardElement);
    });
}

function applyFilter() {
    const filter = document.getElementById('filter').value;
    const filterValue = document.getElementById('filterValue').value;
    fetch(`http://localhost:3000/cards?${filter}=${filterValue}`)
        .then(response => response.json())
        .then(data => displayCards(data));
}