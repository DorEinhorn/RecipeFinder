// app.js

let currentPage = 1;
const resultsPerPage = 10;

document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value;
    const cuisineType = document.getElementById('cuisine-type').value;
    currentPage = 1;  // Reset to the first page on a new search
    fetchRecipes(query, cuisineType, currentPage);
    document.querySelector('.search-bar').style.display = 'none';
    document.getElementById('back-to-search').style.display = 'block';
    document.getElementById('pagination').style.display = 'flex';
});

document.getElementById('back-to-search').addEventListener('click', () => {
    document.querySelector('.search-bar').style.display = 'flex';
    document.getElementById('recipe-list').innerHTML = '';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('back-to-search').style.display = 'none';
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        const query = document.getElementById('search-input').value;
        const cuisineType = document.getElementById('cuisine-type').value;
        fetchRecipes(query, cuisineType, currentPage);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    const query = document.getElementById('search-input').value;
    const cuisineType = document.getElementById('cuisine-type').value;
    fetchRecipes(query, cuisineType, currentPage);
});

async function fetchRecipes(query, cuisineType, page) {
    try {
        const startIndex = (page - 1) * resultsPerPage;
        let url = `https://api.edamam.com/search?q=${query}&app_id=56607a64&app_key=577d1e564df217f931a1a26830348386&from=${startIndex}&to=${startIndex + resultsPerPage}`;
        if (cuisineType) {
            url += `&cuisineType=${cuisineType}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);  // Log the response data for debugging
        if (data.hits && Array.isArray(data.hits)) {
            displayRecipes(data.hits);
            updatePagination(data);
        } else {
            console.error('No recipes found or data format is incorrect');
            document.getElementById('recipe-list').innerHTML = '<p>No recipes found. Please try a different search term.</p>';
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        document.getElementById('recipe-list').innerHTML = '<p>Error fetching recipes. Please try again later.</p>';
    }
}

function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeItem = document.createElement('div');
        recipeItem.classList.add('recipe-item');
        recipeItem.innerHTML = `
            <img src="${recipe.recipe.image}" alt="${recipe.recipe.label}">
            <h2>${recipe.recipe.label}</h2>
            <p>${recipe.recipe.source}</p>
            <button class="favorite-button">Save to Favorites</button>
        `;
        recipeItem.addEventListener('click', () => displayRecipeDetails(recipe.recipe));
        recipeList.appendChild(recipeItem);

        // Add event listener for the favorite button
        const favoriteButton = recipeItem.querySelector('.favorite-button');
        favoriteButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent triggering the recipe details modal
            saveToFavorites(recipe.recipe);
        });
    });
}

function displayRecipeDetails(recipe) {
    const modal = document.getElementById('recipe-modal');
    const recipeDetails = document.getElementById('recipe-details');
    recipeDetails.innerHTML = `
        <h2>${recipe.label}</h2>
        <img src="${recipe.image}" alt="${recipe.label}">
        <p><strong>Source:</strong> ${recipe.source}</p>
        <p><strong>Ingredients:</strong></p>
        <ul>
            ${recipe.ingredientLines.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        <p><strong>Instructions:</strong> <a href="${recipe.url}" target="_blank">View Instructions</a></p>
    `;
    modal.style.display = 'block';

    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}

function saveToFavorites(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.push(recipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Recipe saved to favorites!');
}

function updatePagination(data) {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    if (pageInfo && prevButton && nextButton) {
        pageInfo.textContent = `Page ${currentPage}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = !data.more;
    }
}
