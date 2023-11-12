"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDelBttn = false) {
  // console.debug("generateStoryMarkup", story);

  let favStar = false;
  if (Boolean(currentUser)) {
    console.debug("[generateStoryMarkup]Current User : Generating Favorite Stars")
    favStar = true;
  }

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${showDelBttn ? generateHTMLDel() : ''}
        ${favStar ? generateHTMLStar(currentUser, story) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/**Helper for generateStoryMarkup
 * based on the currentUser: 
 * if storyId is a favorite, return shaded star
 * if storyId is not a favorite, return unshaded star
 */
function generateHTMLStar(user, story) {
  let isFavorite = (user.favorites.filter(fav => { return fav.storyId == story.storyId })).length > 0
  let starType = isFavorite ? "fas" : "far";

  return `
  <span class="star">
    <i class="${starType} fa-star"></i>
  </span>`;
}

/**
 * Helper for generateStoryMarkup
 * return HTML delete button (borrowed from soln)
 */
function generateHTMLDel() {
  return `
  <span class="trash-can">
    <i class="fas fa-trash-alt"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**Gets list of favorites, generates html and puts on page */

function putFavoritesOnPage() {
  $allStoriesList.empty();

  if (currentUser.favorites.length != 0) {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  } else {
    $allStoriesList.append("<h2>No Favorite Stories</h2>");
  }

  $allStoriesList.show();
}

/** Gets list of user generated stories, generates HTML and puts on page*/
function putMyStoriesOnPage() {
  $allStoriesList.empty();

  if (currentUser.ownStories.length != 0) {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true);
      $allStoriesList.append($story);
    }
  } else {
    $allStoriesList.append("<h2>No User Generated Stories</h2>");
  }

  $allStoriesList.show();
}

/** On Sumbit of the add-story-form this should get the data from the form
 *  Call addStory method and then put the new story on the page. 
*/
async function postNewStory(evt) {
  console.debug("[postNewStory]Start");
  evt.preventDefault();

  //Pull information from add-story-form
  let nsTitle = $("#add-story-title").val();
  let nsAuthor = $("#add-story-author").val();
  let nsURL = $("#add-story-url").val();

  //add story using API
  let story2Post = { title: nsTitle, author: nsAuthor, url: nsURL };
  let postedStory = await storyList.addStory(currentUser, story2Post);

  //Generate Markup and prepend to beginning of list
  let storyHTML = generateStoryMarkup(postedStory);
  $allStoriesList.prepend(storyHTML);

  //Reset form and hide UI
  $submitForm.trigger("reset");
  $submitForm.hide();
}

$submitForm.on("submit", postNewStory);

/**
 * Handle Click of favorite stars for logged in users
 * Should find the storyId of the element
 * find if the item is favorited by checking which kind of star
 * add/remove favorite from users favorites
 */
async function toggleFavorite(evt) {

  //find storyId
  let closestLI = $(evt.target).closest("li");
  let foundID = closestLI.attr("id");

  //story to pass into methods
  let story = storyList.stories.find(s => s.storyId == foundID);

  //find out which star is in use
  if (!$(evt.target).hasClass("fas")) {
    await currentUser.addStoryFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  } else {
    await currentUser.deleteStoryFavorite(story);
    $(evt.target).closest("i").toggleClass("fas far");
  }

}

$storiesList.on("click", ".star", toggleFavorite);

/**
 * Handle Click of the delete trash can for logged in users
 * Should find the storyId of the closest element
 * remove the story 
 * regenerate the on screen list
 */
async function deleteStory(evt) {

  const closestLI = $(evt.target).closest("li");
  const storyId = closestLI.attr("id");

  await storyList.removeStory(currentUser, storyId);

  putMyStoriesOnPage();

}
$storiesList.on("click", ".trash-can", deleteStory);
