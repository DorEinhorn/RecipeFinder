let currentPage = 1;
const resultsPerPage = 10;
const errorMessage = document.createElement('div');

errorMessage.id = 'error-message';
errorMessage.style.display = 'none';
errorMessage.style.backgroundColor = '#ffdddd';
errorMessage.style.borderLeft = '6px solid #f44336';
errorMessage.style.color = '#f44336';
errorMessage.style.padding = '10px';
errorMessage.style.margin = '20px';
document.getElementById('recipe-list').prepend(errorMessage);

document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.split(',').map(ingredient => ingredient.trim()).join('%2C');
    const cuisineType = document.getElementById('cuisine-type').value;
    const category = document.getElementById('recipe-category').value;
    currentPage = 1;  // Reset to the first page on a new search
    fetchRecipes(query, cuisineType, category, currentPage);
    document.querySelector('.search-bar').style.display = 'none';
    document.getElementById('back-to-search').style.display = 'block';
    document.getElementById('pagination').style.display = 'flex';
});

document.getElementById('back-to-search').addEventListener('click', () => {
    document.querySelector('.search-bar').style.display = 'flex';
    document.getElementById('recipe-list').innerHTML = '';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('back-to-search').style.display = 'none';
    errorMessage.style.display = 'none';
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        const query = document.getElementById('search-input').value;
        const cuisineType = document.getElementById('cuisine-type').value;
        const category = document.getElementById('recipe-category').value;
        fetchRecipes(query, cuisineType, category, currentPage);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    currentPage++;
    const query = document.getElementById('search-input').value;
    const cuisineType = document.getElementById('cuisine-type').value;
    const category = document.getElementById('recipe-category').value;
    fetchRecipes(query, cuisineType, category, currentPage);
});

document.getElementById('view-favorites').addEventListener('click', () => {
    displayFavorites();
    document.getElementById('favorites-modal').style.display = 'block';
});

document.querySelector('.close-favorites').addEventListener('click', () => {
    document.getElementById('favorites-modal').style.display = 'none';
});

document.getElementById('view-shopping-list').addEventListener('click', () => {
    displayShoppingList();
    document.getElementById('shopping-list-modal').style.display = 'block';
});

document.querySelector('.close-shopping-list').addEventListener('click', () => {
    document.getElementById('shopping-list-modal').style.display = 'none';
});

async function fetchRecipes(query, cuisineType, category, page) {
    try {
        document.getElementById('spinner').style.display = 'block'; // Show spinner
        const from = (page - 1) * resultsPerPage;
        const to = from + resultsPerPage;
        const response = await fetch(`https://api.edamam.com/search?q=${query}&app_id=56607a64&app_key=577d1e564df217f931a1a26830348386&from=${from}&to=${to}&cuisineType=${cuisineType}&mealType=${category}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        if (data.hits.length === 0) {
            displayError('No recipes found.');
        } else {
            displayRecipes(data.hits);
            updatePagination(data);
            errorMessage.style.display = 'none';
        }
    } catch (error) {
        displayError('Error fetching recipes. Please try again later.');
        console.error('Error fetching recipes:', error);
    } finally {
        document.getElementById('spinner').style.display = 'none'; // Hide spinner
    }
}

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function displayRecipes(recipes) {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    
    recipes.forEach(({ recipe }) => {
        const recipeItem = document.createElement('div');
        recipeItem.classList.add('recipe-item');
        recipeItem.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.label}">
            <h2>${recipe.label}</h2>
            <p>${recipe.source}</p>
        `;
        recipeItem.addEventListener('click', () => openRecipeModal(recipe));
        recipeList.appendChild(recipeItem);
    });

    document.getElementById('back-to-search').style.display = 'block';
    errorMessage.style.display = 'none';
}

function openRecipeModal(recipe) {
    const recipeDetails = document.getElementById('recipe-details');
    recipeDetails.innerHTML = `
        <h3>${recipe.label}</h3>
        <img src="${recipe.image}" alt="${recipe.label}">
        <ul>
            ${recipe.ingredientLines.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        <a href="${recipe.url}" target="_blank">View Full Recipe</a>
    `;
    document.getElementById('recipe-modal').style.display = 'block';
}

document.querySelector('.close-button').addEventListener('click', () => {
    document.getElementById('recipe-modal').style.display = 'none';
});

function addToFavorites(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.label === recipe.label)) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Recipe added to favorites!');
    } else {
        alert('Recipe is already in favorites!');
    }
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesList = document.getElementById('favorites-list-modal');
    favoritesList.innerHTML = '';

    favorites.forEach((recipe, index) => {
        const li = document.createElement('li');
        li.classList.add('favorite-item');
        li.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.label}">
            <div class="favorite-item-info">
                <h3>${recipe.label}</h3>
                <p>${recipe.source}</p>
            </div>
        `;
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-favorite-button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeFromFavorites(index);
        });
        li.appendChild(removeButton);
        favoritesList.appendChild(li);
    });
}

function removeFromFavorites(index) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites.splice(index, 1);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites(); // Refresh the favorites list
}

function displayShoppingList() {
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    const shoppingListUl = document.getElementById('shopping-list');
    shoppingListUl.innerHTML = '';

    shoppingList.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = item;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeFromShoppingList(index);
        });
        li.appendChild(removeButton);
        shoppingListUl.appendChild(li);
    });
}

function addToShoppingList(ingredients) {
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    ingredients.forEach(ingredient => {
        if (!shoppingList.includes(ingredient)) {
            shoppingList.push(ingredient);
        }
    });
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    alert('Ingredients added to shopping list!');
}

function removeFromShoppingList(index) {
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    shoppingList.splice(index, 1);
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    displayShoppingList(); // Refresh the shopping list
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

function shareViaEmail(recipe) {
    const subject = encodeURIComponent(`Check out this recipe: ${recipe.label}`);
    const body = encodeURIComponent(`I found this recipe and thought you might like it:\n\n${recipe.label}\n\nIngredients:\n${recipe.ingredientLines.join('\n')}\n\nInstructions:\n${recipe.url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function shareViaFacebook(recipe) {
    const url = encodeURIComponent(recipe.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareViaTwitter(recipe) {
    const text = encodeURIComponent(`Check out this recipe: ${recipe.label} ${recipe.url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

document.getElementById('save-to-favorites-modal').addEventListener('click', () => {
    const recipe = JSON.parse(document.getElementById('recipe-details').dataset.recipe);
    addToFavorites(recipe);
});

document.getElementById('add-to-shopping-list').addEventListener('click', () => {
    const recipe = JSON.parse(document.getElementById('recipe-details').dataset.recipe);
    addToShoppingList(recipe.ingredientLines);
});
