"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** When a logged in user clicks "submit" on the navbar */
function submitClick() {
  console.debug("Submit Click")
  $submitForm.show();
}

$navSubmit.on("click", submitClick);

/**
 * Show the logged on users favorited stories instead of all stories
 */
function navFavoritesClick() {
  hidePageComponents();
  putFavoritesOnPage();
}
$body.on("click", "#nav-favorites", navFavoritesClick);

/**
 * Show the logged on users stories instead of all stories
 */
function navMyStoriesClick() {
  hidePageComponents();
  putMyStoriesOnPage();
}
$body.on("click", "#nav-my-stories", navMyStoriesClick);
