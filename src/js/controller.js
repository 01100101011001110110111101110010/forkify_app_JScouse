import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import { mod } from 'mathjs';
// import { set } from 'core-js/core/dict';
import { MODAL_CLOSE_SEC } from './config.js';

if (module.hot) module.hot.accept;

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    // 1)обновление результатов поиска для выделения выбранного поискового результата
    resultView.update(model.getSearchResaulPage());
    // 2)Обновление отображения закладок
    bookmarksView.update(model.state.bookmarks);
    // 3)Загрузка рецепта
    await model.loadRecipe(id);
    // 4)Отображаем рецепт
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();
    // 1) Поисковый запрос
    const query = searchView.getQuery();
    if (!query) return;
    // 2) Загрузка поискового результата
    await model.loadSearchResults(query);
    // 3) Отображение результата
    resultView.render(model.getSearchResaulPage());
    // 4) Отображаем кнопки разметки на странице
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Отображение Нового результата
  resultView.render(model.getSearchResaulPage(goToPage));
  // 2) Отображаем Новые кнопки разметки на странице
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Обновление порций рецепта
  model.updateServings(newServings);
  // Отображение новых порций
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Добавление/удаление закладок
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //  2) Обновить вид рецепта
  recipeView.update(model.state.recipe);
  // 3) Отобразить закладки
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Знак загрузки
    addRecipeView.renderSpinner();
    // Загрузка новых данных рецепта
    await model.uploadRecipe(newRecipe);
    // Отображение нового рецепта
    recipeView.render(model.state.recipe);
    // Сообщение о добавлении
    addRecipeView.renderMessage();
    //Отображение закладок
    bookmarksView.render(model.state.bookmarks);

    // Изменить идентификатор Url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Закрыть окно формы
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('😱', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
