
// ======================================
// 1. GET HTML ELEMENTS
// ======================================

const searchButton = document.querySelector("#search-button");
const movieSearch = document.querySelector("#movie-search");
const moviesContainer = document.querySelector("#movies-container");

const closeDetailsButton = document.querySelector("#close-details");
const movieDetails = document.querySelector("#movie-details");
const movieDetailsContent = document.querySelector("#movie-details-content");

const favouritesContainer = document.querySelector("#favourites-container");

// ======================================
// 2. FAVOURITES ARRAY
// ======================================

let favourites = [];

const savedFavourites = localStorage.getItem("favourites");

if (savedFavourites) {
  favourites = JSON.parse(savedFavourites);
}

// ======================================
// 3. DISPLAY FAVOURITES
// ======================================

function displayFavourites() {
  favouritesContainer.innerHTML = "";

  favourites.forEach(function(movie) {

    const favouriteCard = document.createElement("article");

    favouriteCard.classList.add("movie-card");

    const poster = movie.poster_path
      ? "https://image.tmdb.org/t/p/w500" + movie.poster_path
      : "https://placehold.co/500x750/222222/f5c518?text=No+Poster";

    favouriteCard.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>Release date: ${movie.release_date || "Unknown"}</p>
      <p>⭐ Rating: ${typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "Not rated"}/10</p>
      <button class="remove-favourite-button">Remove Favourite</button>
    `;

    const removeButton = favouriteCard.querySelector(".remove-favourite-button");

    removeButton.addEventListener("click", function() {

      // Remove movie from favourites
      favourites = favourites.filter(function(favourite) {
        return favourite.id !== movie.id;
      });

      // Save updated favourites
      localStorage.setItem("favourites", JSON.stringify(favourites));

      // Refresh favourites section
      displayFavourites();

      // Find the matching movie in search results
      const searchCards = moviesContainer.querySelectorAll(".movie-card");

      searchCards.forEach(function(card) {

        if (Number(card.dataset.movieId) === movie.id) {

          const favouriteButton = card.querySelector(".favourite-button");

          favouriteButton.textContent = "❤️ Add to Favourites";
          favouriteButton.disabled = false;

        }

      });

    });

    favouritesContainer.appendChild(favouriteCard);

  });
}

// Load saved favourites when page opens
displayFavourites();

// ======================================
// 4. CLOSE MOVIE DETAILS
// ======================================

closeDetailsButton.addEventListener("click", function() {
  movieDetails.style.display = "none";
});

// ======================================
// 5. SEARCH FOR MOVIES
// ======================================

searchButton.addEventListener("click", function() {

  const movieName = movieSearch.value;
  const searchMessage = document.querySelector("#search-message");

  movieDetails.style.display = "none";

  if (movieName.trim() === "") {
    searchMessage.textContent = "Enter a Movie name";
    return;
  }

  searchMessage.textContent = "Searching for movie names...";

  fetch("http://localhost:3000/api/movies?movie=" + encodeURIComponent(movieName))

    .then(response => {

      if (!response.ok) {
        throw new Error("Something went wrong with the movie service");
      }

      return response.json();

    })

    .then(data => {

      console.log(data);

      searchMessage.textContent =
        "You searched for: " + movieName + ". Found " + data.results.length + " results.";

      moviesContainer.innerHTML = "";

      if (data.results.length === 0) {
        searchMessage.textContent = "No movies found. Try again!";
        return;
      }

      // ======================================
      // 6. CREATE EACH MOVIE CARD
      // ======================================

      data.results.forEach(movie => {

        const movieCard = document.createElement("article");

        movieCard.classList.add("movie-card");

        // Give each card its movie ID
        movieCard.dataset.movieId = movie.id;

        // ======================================
        // 7. CLICK MOVIE CARD TO SHOW DETAILS
        // ======================================

        movieCard.addEventListener("click", function() {

          movieDetails.style.display = "block";

          movieDetailsContent.innerHTML = `
            <h2>${movie.title}</h2>
            <p>Release date: ${movie.release_date || "Unknown"}</p>
            <p>Rating: ${typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "Not rated"}/10</p>
            <p>${movie.overview || "No description available."}</p>
          `;

        });

        // ======================================
        // 8. MOVIE POSTER
        // ======================================

        const poster = movie.poster_path
          ? "https://image.tmdb.org/t/p/w500" + movie.poster_path
          : "https://placehold.co/500x750/222222/f5c518?text=No+Poster";

        // ======================================
        // 9. MOVIE CARD CONTENT
        // ======================================

        movieCard.innerHTML = `
          <img src="${poster}" alt="${movie.title}">
          <h3>${movie.title}</h3>
          <p>Release date: ${movie.release_date || "Unknown"}</p>
          <p>⭐ Rating: ${typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "Not rated"}/10</p>
          <p>${movie.overview || "No description available."}</p>
          <button class="favourite-button">❤️ Add to Favourites</button>
        `;

        // ======================================
        // 10. FIND FAVOURITE BUTTON
        // ======================================

        const favouriteButton = movieCard.querySelector(".favourite-button");

        // Check whether movie is already saved
        const alreadyFavourited = favourites.some(function(favourite) {
          return favourite.id === movie.id;
        });

        if (alreadyFavourited) {
          favouriteButton.textContent = "✓ Added to Favourites";
          favouriteButton.disabled = true;
        }

        // ======================================
        // 11. FAVOURITE BUTTON CLICK EVENT
        // ======================================

        favouriteButton.addEventListener("click", function(event) {

          event.stopPropagation();

          const alreadyFavourited = favourites.some(function(favourite) {
            return favourite.id === movie.id;
          });

          if (alreadyFavourited) {
            console.log("This movie is already in your favourites!");
            return;
          }

          // Add movie to favourites
          favourites.push(movie);

          // Save favourites in localStorage
          localStorage.setItem("favourites", JSON.stringify(favourites));

          // Refresh favourites section
          displayFavourites();

          // Update button
          favouriteButton.textContent = "✓ Added to Favourites";
          favouriteButton.disabled = true;

          console.log(favourites);

        });

        // ======================================
        // 12. ADD MOVIE CARD TO WEBPAGE
        // ======================================

        moviesContainer.appendChild(movieCard);

      });

    })

    .catch(error => {

      console.log("Something went wrong:", error);

      searchMessage.textContent = "Unable to load movies. Please try again later.";

      moviesContainer.innerHTML = "";

    });

});


