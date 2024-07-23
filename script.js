document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const cocktailGrid = document.getElementById('cocktailGrid');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const saveToFavoritesBtn = document.getElementById('saveToFavorites');
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoritesGrid = document.getElementById('favoritesGrid');
    const showFavoritesBtn = document.getElementById('showFavorites');

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    async function searchCocktail(letter) {
        try {
            const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`);
            const data = await res.json();
            return data.drinks || [];
        } catch (error) {
            console.error('Error fetching cocktails:', error);
            return [];
        }
    }

    function displayCocktails(cocktails) {
        cocktailGrid.innerHTML = '';
        cocktails.forEach((cocktail) => {
            const cocktailItem = document.createElement('div');
            cocktailItem.classList.add('cocktail-item');
            cocktailItem.innerHTML = `
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
                <p>${cocktail.strDrink}</p>
            `;
            cocktailItem.addEventListener('click', () => {
                showModal(cocktail);
            });
            cocktailGrid.appendChild(cocktailItem);
        });
    }

    function showModal(cocktail) {
        modalContent.innerHTML = `
            <h2>${cocktail.strDrink}</h2>
            <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
            <h3>Ingredients:</h3>
            <ul>
                ${getIngredients(cocktail).join('')}
            </ul>
            <h3>Instructions:</h3>
            <p>${cocktail.strInstructions}</p>
        `;
        modal.style.display = 'block';

        saveToFavoritesBtn.onclick = () => {
            saveToFavorites(cocktail);
        };
    }

    function getIngredients(cocktail) {
        let ingredients = [];
        for (let i = 1; i <= 15; i++) {
            const ingredient = cocktail[`strIngredient${i}`];
            const measure = cocktail[`strMeasure${i}`];
            if (ingredient) {
                ingredients.push(`<li>${ingredient} - ${measure}</li>`);
            }
        }
        return ingredients;
    }

    function saveToFavorites(cocktail) {
        if (!favorites.some(fav => fav.idDrink === cocktail.idDrink)) {
            favorites.push(cocktail);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            alert('Cocktail saved to favorites!');
        } else {
            alert('Cocktail already saved to favorites!');
        }
    }

    function displayFavorites() {
        favoritesGrid.innerHTML = '';
        favorites.forEach(cocktail => {
            const favoriteItem = document.createElement('div');
            favoriteItem.classList.add('favorites-item');
            favoriteItem.innerHTML = `
                <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}">
                <p>${cocktail.strDrink}</p>
                <button class="delete-btn">Delete</button>
            `;
            favoriteItem.querySelector('.delete-btn').addEventListener('click', () => {
                deleteFavorite(cocktail.idDrink);
            });
            favoriteItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    showModal(cocktail);
                }
            });
            favoritesGrid.appendChild(favoriteItem);
        });
    }

    function deleteFavorite(idDrink) {
        favorites = favorites.filter(fav => fav.idDrink !== idDrink);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
        alert('Cocktail removed from favorites!');
    }

    searchInput.addEventListener('keyup', async (e) => {
        const letter = e.target.value.trim().toLowerCase();
        if (letter.length === 1) {
            const cocktails = await searchCocktail(letter);
            displayCocktails(cocktails);
            cocktailGrid.style.display = 'grid';
            favoritesContainer.style.display = 'none';
        }
    });

    // Close modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('close')) {
            modal.style.display = 'none';
        }
    });

    // Show favorites when "Show Favorites" is clicked
    showFavoritesBtn.addEventListener('click', () => {
        displayFavorites();
        favoritesContainer.style.display = 'block';
        cocktailGrid.style.display = 'none';
    });
});