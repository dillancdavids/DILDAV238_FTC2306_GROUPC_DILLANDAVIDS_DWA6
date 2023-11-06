import { selectors, getHtmlElement } from "./domData.js";
import { BOOKS_PER_PAGE } from "./data.js";

/**
 *
 * @param {Object} prop
 * @param {Number} [target]
 * @returns {Object}
 */
export const loadedTracker = (prop) => {
  if (typeof prop !== "object" || prop === null) {
    throw new Error(`${prop} needed to be an array. Expected an array, received ${typeof prop}.`);
  }
  let tracker = 0;
  const increase = () => {
    tracker += BOOKS_PER_PAGE;
  };
  
  const refValue = () => {
    return tracker;
  };

  const checker = () => {
    let booksLeft = prop.length - BOOKS_PER_PAGE - tracker;
    let btnText = booksLeft > 0 ? booksLeft : 0;
    const button = getHtmlElement(".list__remaining", selectors.loadMore);
    button.textContent = `(${btnText})`;
    return button
  };
  

  const loaded = () =>{
    let booksLoaded = BOOKS_PER_PAGE + tracker
    return booksLoaded
  }

  return {
    increase,
    checker,
    refValue,
    loaded,
  };
};



