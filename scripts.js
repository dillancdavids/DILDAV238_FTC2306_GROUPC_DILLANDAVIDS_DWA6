import { BOOKS_PER_PAGE, authors, books } from "./data.js";
import { selectors, css, innerHTML } from "./domData.js";
import { loadedTracker } from "./modules/helpers.js";

//------------------------------------------------All eventHandlers below-------------------------------------------------------

const previewLoading = loadedTracker(books)
// loads more books when the loadMore button is clicked
const moreBooksHandler = (e) => {
  e.stopPropagation();
  previewLoading.increase()
  previewLoading.checker()
  //With concern to time complexity this event handler will only ever loop through and append a max of 36 items
  for (let i = previewLoading.refValue() ; i < previewLoading.loaded(); i++) {
    if (i === books.length) {
      selectors.loadMore.disabled = true;
      break;
    } else {
      selectors.list.appendChild(innerHTML(books[i], i));
    }
  }
};

// Opens the preview overlay when a preview is clicked and display all the same information as the preview and more
const openOverlayHandler = (e) => {
  const overlay = selectors.previewOverlay.overlay;
  const bookPreview = e.target.closest(".preview");
  const index = bookPreview.dataset.index; // The index is used to retrieve the corresponding data

  selectors.previewOverlay.overlayBlur.src = books[index].image;
  selectors.previewOverlay.overlayImage.src = books[index].image;
  selectors.previewOverlay.titleOverlay.textContent = books[index].title;
  let dateOverlay = new Date(books[index].published).getFullYear();
  selectors.previewOverlay.dataOverlay.textContent = `${
    authors[books[index].author]
  } (${dateOverlay})`;
  selectors.previewOverlay.infoOverlay.textContent = books[index].description;

  overlay.show();
};

// Opens the theme settings and sets it's values
const themeToggleHandler = (e) => {
  // Checks to see if backgroundColor matches that of the set 'night' color scheme
  const darkMode =
    getComputedStyle(document.body).backgroundColor ===
    `rgb(${css.night.light})`;
  selectors.theme.themeSelect.value = darkMode ? "night" : "day";

  const overlay = selectors.theme.themeOverlay;
  const closeBtn = selectors.theme.themeCancelBtn;
  overlay.show();
  if (e.target === closeBtn) {
    overlay.close();
  }
};

// Changes the color scheme when the form values have been saved/submitted
const themeSubmitHandler = (e) => {
  e.preventDefault();

  const overlay = selectors.theme.themeOverlay;
  const formData = new FormData(e.target);
  const themeChoice = Object.fromEntries(formData);
  const theme = themeChoice.theme;
  document.documentElement.style.setProperty("--color-dark", css[theme].dark);
  document.documentElement.style.setProperty("--color-light", css[theme].light);
  overlay.close();
};

let formValues; //Will only be truthy when the searchFrom is submitted

//Opens/closes the filter form
const searchToggleHandler = (e) => {
  const overlay = selectors.search.searchOverlay;
  const closeBtn = selectors.search.searchCancelBtn;
  overlay.show();
  if (formValues) {
    // The values are based on what was entered into the form
    selectors.genresSelect.value = formValues.genre;
    selectors.authorSelect.value = formValues.author;
    selectors.title.value = formValues.title;
  }
  if (e.target === closeBtn) {
    overlay.close();
    selectors.search.searchForm.reset();
  }
};

let filteredBooks; // Will only be truthy when searchForm is submitted
let filterLoading;

const searchSubmitHandler = (e) => {
  e.preventDefault();
  const overlay = selectors.search.searchOverlay;
  const formData = new FormData(e.target);
  const filters = Object.fromEntries(formData);
  const result = [];
  books.forEach((book, index) => {
    const { title, author, genres } = book;
    const categories = [...genres]; //Spread operator to make sifting through the data easier instead of using a for of loop

    const genreMatch =
      categories.includes(filters.genre) || filters.genre === "All";
    const authorMatch = author === filters.author || filters.author === "All";
    const titleMatch =
      title.toLowerCase().includes(filters.title.toLowerCase()) ||
      filters.title === "";
    //Only if all three are true will the data get pushed to the array
    if (authorMatch && genreMatch && titleMatch) {
      result.push([book, index]);
    }
  });
  //---------------------------------------------Retrieving and manipulating data above this line-----------------------------------------
  //-----------------------------------------------Below this line: Conditionals and actions----------------------------------------------
  const previews = selectors.list.querySelectorAll(".preview");
  for (const book of previews) {
    book.remove(); //Upon submission all previous books are removed
  }

  if (result.length === 0) {
    // If no matches are found the needed message pops up and loadMore button is disabled
    selectors.message.classList.add("list__message_show");
    selectors.loadMore.disabled = true;
    selectors.loadMore.querySelector(".list__remaining").textContent = `(0)`;
  } else {
    selectors.message.classList.remove("list__message_show");
    selectors.loadMore.disabled = false;
  }

  if (result.length < BOOKS_PER_PAGE) {
    // Loads and appends books and disables the button
    for (let i = 0; i < result.length; i++) {
      let book = result[i][0];
      let index = result[i][1];
      selectors.list.appendChild(innerHTML(book, index));
      selectors.loadMore.disabled = true;
      selectors.loadMore.querySelector(".list__remaining").textContent = `(0)`;
    }
  } else {
    //If there are more books than 36, then 36 are loaded, the rest are loaded with a "new" eventListener
    for (let i = 0; i < BOOKS_PER_PAGE; i++) {
      let book = result[i][0];
      let index = result[i][1];
      selectors.list.appendChild(innerHTML(book, index));
      selectors.loadMore.querySelector(".list__remaining").textContent = `(${
        result.length - BOOKS_PER_PAGE
      })`;
      selectors.loadMore.removeEventListener("click", moreBooksHandler); //Old eventListener is removed
      filteredBooks = result;
      filterLoading = loadedTracker(filteredBooks) 
    }
  }

  overlay.close();
  window.scrollTo({ top: 0, behavior: "smooth" });
  formValues = filters; // formValues receives the same data as the filters variable i.e gets used in the searchToggleHandler
};

//Same concept as the moreBooksHandler but only runs if filteredBooks is truthy

const filterMoreHandler = (e) => {
  if (!filteredBooks) {
    return;
  }
  filterLoading.increase()
  filterLoading.checker()
  for (let i = filterLoading.refValue(); i < filterLoading.loaded(); i++) {
    if (i === filteredBooks.length) {
      selectors.loadMore.disabled = true;
      break;
    } else {
      let book = filteredBooks[i][0];
      let index = filteredBooks[i][1];
      selectors.list.appendChild(innerHTML(book, index));
    }
  }
};

//------------------------------------------------All eventListeners fall below----------------------------------------------------

selectors.loadMore.addEventListener("click", moreBooksHandler);
selectors.loadMore.addEventListener("click", filterMoreHandler);
selectors.list.addEventListener("click", openOverlayHandler);
selectors.previewOverlay.overlayBtn.addEventListener("click", () => {
  selectors.previewOverlay.overlay.close();
});

selectors.theme.themeBtn.addEventListener("click", themeToggleHandler);
selectors.theme.themeCancelBtn.addEventListener("click", themeToggleHandler);
selectors.theme.themeForm.addEventListener("submit", themeSubmitHandler);
selectors.search.searchBtn.addEventListener("click", searchToggleHandler);
selectors.search.searchCancelBtn.addEventListener("click", searchToggleHandler);
selectors.search.searchForm.addEventListener("submit", searchSubmitHandler);
