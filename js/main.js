const myBtnOpen = document.getElementById("myBtnOpen");
const myBtnClose = document.getElementById("myBtnClose");
const slideBar = document.getElementById("slideBar");
const myLinks = document.getElementById("myLinks");
const randomMeals = document.getElementById("randomMeals");
const main = document.getElementById("main");
const search = document.getElementById("search");
const categories = document.getElementById("categories");
const areas = document.getElementById("areas");
const ingredient = document.getElementById("ingredient");
const contactUs = document.getElementById("contactUs");

// Class lists
const list = slideBar.classList;
const link = myLinks.classList;

// Navigation history
let navigationHistory = [];

// Initialize
document.addEventListener("DOMContentLoaded", mainPageload);

// Sidebar
myBtnClose.addEventListener("click", toggleSidebar);
myBtnOpen.addEventListener("click", toggleSidebar);

function toggleSidebar() {
  if (list.contains("slide")) {
    list.add("nonSlide");
    myBtnOpen.classList.remove("d-none");
    myBtnClose.classList.add("d-none");
    list.remove("slide");
    link.remove("glideUp");
    link.add("glideDown");
  } else {
    list.remove("nonSlide");
    list.add("slide");
    myBtnClose.classList.remove("d-none");
    myBtnOpen.classList.add("d-none");
    link.add("glideUp");
    link.remove("glideDown");
  }
}

// Main page
async function mainPageload() {
  try {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/search.php?s="
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayRandomMeals(data.meals);
  } catch (error) {
    console.error(error.message);
    randomMeals.innerHTML = '<p class="text-white">Error loading meals</p>';
  }
}

function displayRandomMeals(arr) {
  if (!arr) {
    randomMeals.innerHTML = "<p class='text-white'>No meals found</p>";
    return;
  }

  randomMeals.innerHTML = arr
    .map(
      (meal) => `
    <div class="col py-3">
      <div class="meal position-relative overflow-hidden rounded" data-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <div class="mealLayer position-absolute d-flex align-items-center justify-content-start ps-3">
          <h3 class="text-dark">${meal.strMeal}</h3>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  addMealClickHandlers("#randomMeals");
}

// Search page
search.addEventListener("click", handleNavigationClick(displaySearchPage));

function displaySearchPage() {
  navigationHistory.push({ type: "search" });
  main.innerHTML = `
    <section id="searchPage" class="bg-dark text-white">
      <section id="searchContainer" class="container py-5 d-flex justify-content-between">
        <div class="form-floating mb-3 w-50 me-2">
          <input type="text" class="form-control  text-white" id="searchNameInput" placeholder="Search by name">
          <label for="searchNameInput" class="text-dark">Search by name</label>
        </div>
        <div class="form-floating mb-3 w-50">
          <input type="text" class="form-control  text-white" id="searchLetterInput" placeholder="Search by first letter" maxlength="1">
          <label for="searchLetterInput" class="text-dark">Search by first letter</label>
        </div>
      </section>
      <section class="container mt-3">
        <div id="searchResults" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4"></div>
      </section>
    </section>
  `;

  setTimeout(() => {
    const searchNameInput = document.getElementById("searchNameInput");
    const searchLetterInput = document.getElementById("searchLetterInput");
    const meals = document.getElementById("searchResults");

    const debounce = (func, delay) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
      };
    };

    const handleSearch = debounce(async (type, value) => {
      if (!value.trim()) return;
      try {
        const url =
          type === "name"
            ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${value}`
            : `https://www.themealdb.com/api/json/v1/1/search.php?f=${value}`;

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Response status: ${response.status}`);
        const data = await response.json();
        displaySearchResults(data.meals);
      } catch (error) {
        console.error("Search error:", error);
        meals.innerHTML = '<p class="text-white">Error loading results</p>';
      }
    }, 300);

    searchNameInput.addEventListener("input", (e) =>
      handleSearch("name", e.target.value)
    );
    searchLetterInput.addEventListener("input", (e) =>
      handleSearch("letter", e.target.value)
    );
  }, 0);
}

function displaySearchResults(arr) {
  const meals = document.getElementById("searchResults");
  if (!arr) {
    meals.innerHTML = "<p class='text-white'>No meals found</p>";
    return;
  }

  meals.innerHTML = arr
    .map(
      (meal) => `
    <div class="col py-3">
      <div class="meal position-relative overflow-hidden rounded" data-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
        <div class="mealLayer position-absolute d-flex align-items-center justify-content-start ps-3">
          <h3 class="text-dark">${meal.strMeal}</h3>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  addMealClickHandlers("#searchResults");
}

// Categories page
categories.addEventListener(
  "click",
  handleNavigationClick(displayCategoriesPage)
);

function displayCategoriesPage() {
  navigationHistory.push({ type: "categories" });
  main.innerHTML = `
    <section id="categoryPage" class="py-5 bg-dark">
      <section class="container">
        <div id="Category" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4"></div>
      </section>
    </section>
  `;

  setTimeout(getCategories, 0);
}

async function getCategories() {
  const Category = document.getElementById("Category");
  try {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/categories.php"
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayCategories(data.categories);
  } catch (error) {
    console.error(error.message);
    Category.innerHTML = '<p class="text-white">Error loading categories</p>';
  }
}

function displayCategories(arr) {
  const Category = document.getElementById("Category");
  if (!arr) {
    Category.innerHTML = "<p class='text-white'>No categories found</p>";
    return;
  }

  Category.innerHTML = arr
    .filter((cat) => cat.strCategory !== "Pork")
    .map(
      (cat) => `
      <div class="col py-3">
        <div class="meal position-relative overflow-hidden rounded" data-category="${
          cat.strCategory
        }">
          <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" />
          <div class="mealLayer position-absolute d-flex flex-column align-items-center justify-content-start ps-3">
            <p class="text-dark p-3">${
              cat.strCategoryDescription?.split(" ", 15).join(" ") || ""
            }</p>
          </div>
        </div>
        <h4 class="text-warning text-center">${cat.strCategory}</h4>
      </div>
    `
    )
    .join("");

  document.querySelectorAll("[data-category]").forEach((card) => {
    card.addEventListener("click", async function () {
      const category = this.getAttribute("data-category");
      await showMealsByCategory(category);
    });
  });
}

// Areas page - Fixed this section
areas.addEventListener("click", handleNavigationClick(displayAreasPage));

function displayAreasPage() {
  navigationHistory.push({ type: "areas" });
  main.innerHTML = `
    <section id="areaPage" class="bg-dark">
      <div class="container py-3">
        <div id="area" class="row row-cols-sm-2 row-cols-1 row-cols-lg-3 row-cols-xl-4"></div>
      </div>
    </section>
  `;

  setTimeout(getArea, 0);
}

async function getArea() {
  const areaElement = document.getElementById("area");
  try {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayArea(data.meals);
  } catch (error) {
    console.error(error.message);
    areaElement.innerHTML = '<p class="text-white">Error loading areas</p>';
  }
}

function displayArea(arr) {
  const areaElement = document.getElementById("area");
  if (!arr) {
    areaElement.innerHTML = "<p class='text-white'>No areas found</p>";
    return;
  }

  areaElement.innerHTML = arr
    .map(
      (area) => `
    <div class="col py-3 d-flex flex-column justify-content-center align-items-center">
      <div class="meal text-center" data-area="${area.strArea}">
        <img class="img-fluid" src="./imgsIcons/flags/${area.strArea}.png" 
             alt="${area.strArea} flag" />
        <h3 class="text-white pt-2 text-center">${area.strArea}</h3>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll("[data-area]").forEach((card) => {
    card.addEventListener("click", async function () {
      const area = this.getAttribute("data-area");
      await showMealsByArea(area);
    });
  });
}

// Ingredients page
ingredient.addEventListener(
  "click",
  handleNavigationClick(displayIngredientPage)
);

function displayIngredientPage() {
  navigationHistory.push({ type: "ingredients" });
  main.innerHTML = `
    <section id="ingredientsPage" class="bg-dark">
      <div class="container py-3">
        <div id="ingredients" class="row row-cols-sm-2 row-cols-1 row-cols-lg-3 row-cols-xl-4"></div>
      </div>
    </section>
  `;

  setTimeout(getIngredients, 0);
}

async function getIngredients() {
  const ingredientsElement = document.getElementById("ingredients");
  try {
    const response = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?i=list"
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayIngredients(data.meals);
  } catch (error) {
    console.error(error.message);
    ingredientsElement.innerHTML =
      '<p class="text-white">Error loading ingredients</p>';
  }
}

function displayIngredients(arr) {
  const ingredientsElement = document.getElementById("ingredients");
  if (!arr) {
    ingredientsElement.innerHTML =
      "<p class='text-white'>No ingredients found</p>";
    return;
  }

  ingredientsElement.innerHTML = arr
    .slice(0, 25)
    .map(
      (ing) => `
    <div class="col h-100 pb-3 d-flex flex-column justify-content-center align-items-center">
      <div class="meal text-center" data-ingredient="${ing.strIngredient}">
        <img class="img-fluid" src="https://www.themealdb.com/images/ingredients/${
          ing.strIngredient
        }.png" 
             alt="${
               ing.strIngredient
             }" onerror="this.src='../imgsIcons/Ingredient.png'" />
        <h3 class="text-white pt-2 text-center">${ing.strIngredient}</h3>
        <p class="text-warning text-center">${
          ing.strDescription?.split(" ", 20).join(" ") || ""
        }</p>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll("[data-ingredient]").forEach((card) => {
    card.addEventListener("click", async function () {
      const ingredient = this.getAttribute("data-ingredient");
      await showMealsByIngredient(ingredient);
    });
  });
}

// Common functions
async function showMealsByCategory(category) {
  navigationHistory.push({ type: "category", id: category });
  showLoading();
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayMealList(data.meals, `Meals in ${category} Category`);
  } catch (error) {
    console.error(error);
    main.innerHTML = `<p class="text-white">Error loading ${category} meals</p>`;
  }
}

async function showMealsByArea(area) {
  navigationHistory.push({ type: "area", id: area });
  showLoading();
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayMealList(data.meals, `Meals from ${area}`);
  } catch (error) {
    console.error(error);
    main.innerHTML = `<p class="text-white">Error loading ${area} meals</p>`;
  }
}

async function showMealsByIngredient(ingredient) {
  navigationHistory.push({ type: "ingredient", id: ingredient });
  showLoading();
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const data = await response.json();
    displayMealList(data.meals, `Meals with ${ingredient}`);
  } catch (error) {
    console.error(error);
    main.innerHTML = `<p class="text-white">Error loading meals with ${ingredient}</p>`;
  }
}

function showLoading() {
  main.innerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-warning"></div></div>';
}

function displayMealList(meals, title) {
  if (!meals || meals.length === 0) {
    main.innerHTML = `<p class="text-white text-center py-5">No meals found</p>`;
    return;
  }

  main.innerHTML = `
    <section  class="py-5 bg-dark min-vh-100">
      <div class="container">
        <button id="backButton" class="btn btn-warning mb-4">
          <i class="fas fa-arrow-left me-2"></i> Back
        </button>
        <h2 class="text-warning mb-4">${title}</h2>
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4">
          ${meals
            .map(
              (meal) => `
            <div class="col py-3">
              <div class="meal position-relative overflow-hidden rounded" data-id="${meal.idMeal}">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
                <div class="mealLayer position-absolute d-flex align-items-center justify-content-start ps-3">
                  <h3 class="text-dark">${meal.strMeal}</h3>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;

  addMealClickHandlers("#main");
  document.getElementById("backButton").addEventListener("click", navigateBack);
}

// Meal details functionality
function addMealClickHandlers(containerSelector) {
  document
    .querySelectorAll(`${containerSelector} .meal[data-id]`)
    .forEach((mealCard) => {
      mealCard.addEventListener("click", async function () {
        const mealId = this.getAttribute("data-id");
        await showMealDetails(mealId);
      });
    });
}

async function showMealDetails(mealId) {
  showLoading();
  try {
    const meal = await fetchMealDetails(mealId);
    if (meal) {
      displayMealDetailsPage(meal);
    } else {
      main.innerHTML =
        '<p class="text-white text-center py-5">Meal not found</p>';
    }
  } catch (error) {
    console.error("Error loading meal details:", error);
    main.innerHTML = `<p class="text-danger text-center py-5">Error: ${error.message}</p>`;
  }
}

async function fetchMealDetails(mealId) {
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
  );
  if (!response.ok) throw new Error(`Response status: ${response.status}`);
  const data = await response.json();
  return data.meals?.[0];
}

function displayMealDetailsPage(meal) {
  navigationHistory.push({ type: "details", id: meal.idMeal });

  main.innerHTML = `
    <section id="mealDetailsPage" class="py-5 bg-dark text-white">
      <div class="container">
        <button id="backButton" class="btn btn-warning mb-4">
          <i class="fas fa-arrow-left me-2"></i> Back
        </button>
        <div class="row">
          <div class="col-md-6">
            <img src="${meal.strMealThumb}" alt="${
    meal.strMeal
  }" class="img-fluid rounded">
            ${
              meal.strYoutube
                ? `
            <div class="mt-3">
              <h4 class="text-warning">Video Tutorial</h4>
              <div class="ratio ratio-16x9">
                <iframe src="https://www.youtube.com/embed/${
                  meal.strYoutube.split("v=")[1]
                }" 
                        title="${meal.strMeal} video tutorial" 
                        allowfullscreen></iframe>
              </div>
            </div>`
                : ""
            }
          </div>
          <div class="col-md-6">
            <h2 class="text-warning">${meal.strMeal}</h2>
            ${
              meal.strArea
                ? `<p class="text-white"><strong>Area:</strong> ${meal.strArea}</p>`
                : ""
            }
            ${
              meal.strCategory
                ? `<p class="text-white"><strong>Category:</strong> ${meal.strCategory}</p>`
                : ""
            }
            
            <div class="mt-4">
              <h4 class="text-warning">Ingredients</h4>
              <ul class="list-unstyled ingredients-list">
                ${getIngredientsList(meal)}
              </ul>
            </div>
            
            <div class="mt-4">
              <h4 class="text-warning">Instructions</h4>
              <p class="text-white">${formatInstructions(
                meal.strInstructions
              )}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById("backButton").addEventListener("click", navigateBack);
}

function getIngredientsList(meal) {
  let ingredients = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients += `<li class="text-white"><strong>${ingredient}:</strong> ${
        measure || "To taste"
      }</li>`;
    }
  }
  return ingredients;
}

function formatInstructions(instructions) {
  if (!instructions) return "";
  return instructions
    .split("\r\n")
    .filter((step) => step.trim())
    .map((step) => `<p class="text-white mb-3">${step}</p>`)
    .join("");
}

// Navigation
function navigateBack() {
  if (navigationHistory.length > 1) {
    navigationHistory.pop(); // Remove current page
    const previousPage = navigationHistory.pop();

    if (previousPage.type === "category") {
      showMealsByCategory(previousPage.id);
    } else if (previousPage.type === "area") {
      showMealsByArea(previousPage.id);
    } else if (previousPage.type === "ingredient") {
      showMealsByIngredient(previousPage.id);
    } else if (previousPage.type === "categories") {
      displayCategoriesPage();
    } else if (previousPage.type === "areas") {
      displayAreasPage();
    } else if (previousPage.type === "ingredients") {
      displayIngredientPage();
    } else if (previousPage.type === "search") {
      displaySearchPage();
    } else {
      mainPageload();
    }
  } else {
    mainPageload();
  }
}

// Contact Us page
contactUs.addEventListener(
  "click",
  handleNavigationClick(displayContactUsPage)
);

function displayContactUsPage() {
  navigationHistory.push({ type: "contact" });
  main.innerHTML = `
    <section id="contactUsPage" class="text-white">
      <div class="container px-lg-4 ">
        <div class="row row-cols-1 row-cols-lg-2 px-lg-5 g-3">
          <div class="col">
            <input type="text" class="form-control  text-black" id="fName" placeholder="Enter Your Name">
            <p class="text-center d-none fs-6 alert alert-danger mt-2 py-2 rounded-3">Special characters and numbers not allowed</p>
          </div>
          <div class="col">
            <input type="email" class="form-control  text-black" id="email" placeholder="Enter Your Email">
            <p class="text-center d-none fs-6 alert alert-danger mt-2 py-2 rounded-3">Email is not valid | example@route.com</p>
          </div>
          <div class="col">
            <input type="text" class="form-control  text-black" id="pNum" placeholder="Enter Your Phone Number">
            <p class="text-center d-none fs-6 alert alert-danger mt-2 py-2 rounded-3">Enter a valid phone number | 01023456789</p>
          </div>
          <div class="col">
            <input type="number" class="form-control  text-black" id="age" placeholder="Enter your Age">
            <p class="text-center d-none fs-6 alert alert-danger mt-2 py-2 rounded-3">Enter valid age | max:120</p>
          </div>
          <div class="col">
            <input type="password" class="form-control  text-black" id="pass" placeholder="Enter your Password">
            <p class="text-center d-none fs-6 alert alert-danger mt-2 py-2 rounded-3">Minimum eight characters, at least one letter and one number</p>
          </div>
          <div class="col">
            <input type="password" class="form-control  text-black" id="rePass" placeholder="Re-Enter your Password">
            <p class="text-center d-none fs-6 alert alert-danger mt-2 py-2 rounded-3">Passwords don't match</p>
          </div>
        </div>
        <div class="w-100 text-center pt-4">
          <button id="submitBtn" class="btn btn-warning px-4">Submit</button>
        </div>
      </div>
    </section>
  `;

  setTimeout(setupContactFormValidation, 0);
}
function setupContactFormValidation() {
  const fName = document.getElementById("fName");
  const email = document.getElementById("email");
  const pNum = document.getElementById("pNum");
  const age = document.getElementById("age");
  const pass = document.getElementById("pass");
  const rePass = document.getElementById("rePass");
  const submitBtn = document.getElementById("submitBtn");

  const validationStates = {
    fName: false,
    email: false,
    pNum: false,
    age: false,
    pass: false,
    rePass: false,
  };

  const validateField = (field, regex, errorElement) => {
    const isValid = regex.test(field.value.trim());
    errorElement.classList.toggle("d-none", isValid);
    return isValid;
  };

  const validations = {
    fName: () => {
      validationStates.fName = validateField(
        fName,
        /^[a-zA-Z\u0600-\u06FF\s]+$/,
        fName.nextElementSibling
      );
    },
    email: () => {
      validationStates.email = validateField(
        email,
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        email.nextElementSibling
      );
    },
    pNum: () => {
      validationStates.pNum = validateField(
        pNum,
        /^\d{11}$/,
        pNum.nextElementSibling
      );
    },
    age: () => {
      validationStates.age = validateField(
        age,
        /^(0?[1-9]|[1-9][0-9]|1[01][0-9]|120)$/,
        age.nextElementSibling
      );
    },
    pass: () => {
      validationStates.pass = validateField(
        pass,
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        pass.nextElementSibling
      );
    },
    rePass: () => {
      const isValid = pass.value === rePass.value;
      rePass.nextElementSibling.classList.toggle("d-none", isValid);
      validationStates.rePass = isValid;
    },
  };

  Object.keys(validations).forEach((field) => {
    document.getElementById(field).addEventListener("input", () => {
      validations[field]();
      if (field === "pass") {
        validations.rePass();
      }
    });
  });

  submitBtn.addEventListener("click", function (e) {
    Object.keys(validations).forEach((field) => validations[field]());

    const isFormValid = Object.values(validationStates).every((state) => state);

    if (!isFormValid) {
      e.preventDefault();
      alert("Please correct the errors in the form before submitting.");
      return;
    }

    alert("Form submitted successfully!");
  });

  Object.keys(validations).forEach((field) => validations[field]());
}

// Navigation click handler
function handleNavigationClick(handlerFunction) {
  return function () {
    if (list.contains("slide")) {
      toggleSidebar();
    }
    handlerFunction();
  };
}
