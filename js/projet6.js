const BASE_URL = "http://127.0.0.1:8000";
let footer_date = new Date();
// pour chaque catégorie affichée on prévoit une liste des instances de classe Movie
// la requete par défaut de l'API renvoit 5 films. On choisit d'avoir une liste avec 7 éléments.
// les listes sont actualisées lors de l'usage des boutons "< (precedents) / > (suivants)"
let displayed_categories_number = 4;
// on limite le nombre d'éléments par caroussel
let page_size = 7;

let carroussel_categorie_0 = [];
let carroussel_categorie_1 = [];
let carroussel_categorie_2 = [];
let carroussel_categorie_3 = [];
let best_movie_labels_dict = {"title": "Titre", "description": "Description"};
let movie_labels_dict = {
  "image_url": "Url image",
  "title": "Titre",
  "genres": "Genre",
  "date_published": "Date de sortie",
  "rated": "Rate",
  "imdb_score": "IMDB Score",
  "directors": "Réalisateur(s)",
  "actors": "Acteur(s)",
  "duration": "Durée",
  "countries": "Pays d'origine(s)",
  "votes": "Votes",
  "description": "Description",
}
// ceux sont les attributs ci-dessous qui seront intégrés à la modale.
let attributes_list = [
  "image_url", "title", "genres", "date_published", "rated", "imdb_score", "directors", "actors", "duration", "countries", "votes", "description"
];

// on définit cette structure de données dans le but d'éviter des répétitions.
let movies_genre_list = [
  {"carroussel_name": "carroussel_categorie_0", "carroussel_request": "sort_by=-imdb_score", "current_page": 1},
  {"carroussel_name": "carroussel_categorie_1", "carroussel_request": "genre=animation", "current_page": 1},
  {"carroussel_name": "carroussel_categorie_2", "carroussel_request": "genre=drama", "current_page": 1},
  {"carroussel_name": "carroussel_categorie_3", "carroussel_request": "genre=thriller", "current_page": 1},
];

class Movie {
  constructor(id, image_url, title, genres, date_published, rated, imdb_score, directors, actors, duration, countries, votes, description) {
    this.id = id;
    this.image_url = image_url;
    this.title = title;
    this.genres = genres;
    this.date_published = date_published;
    this.rated = rated;
    this.imdb_score = imdb_score;
    this.directors = directors;
    this.actors = actors;
    this.duration = duration;
    this.countries = countries;
    this.votes = votes;
    this.description = description;
  }
}

function fullfill_best_movie_modal(data) {
  // "fonction callback" qu'on appelle après chargement d'une requete réussie par fetch pour le seul meilleur film
  let temp = ""
  for (attribute in data) {

    if (Object.keys(best_movie_labels_dict).includes(attribute)) {
      temp += best_movie_labels_dict[attribute] + ": " + eval(`data.${attribute}`)+ "<br>";
    }
  }
  return temp;
}

function fullfill_movie_modal(data) {
  // "fonction callback" qu'on appelle après chargement d'une requete réussie par fetch pour tous films
  let temp = ""
  temp += `<div class=""><img src=${data.image_url}></div><div><p>`
  for (attribute in data) {
    if (Object.keys(movie_labels_dict).includes(attribute)) {
      temp += movie_labels_dict[attribute] + ": " + eval(`data.${attribute}`)+ "<br>";
    }
  }
  temp += '</p></div>'
  return temp;
}

function create_events_for_close_modal(modal, modal_content) {
  var span = document.getElementsByClassName("close")[0];
  // cas: utilisateur clique sur le span "x". On cache la modale, on la vide.
  span.onclick = function() {
    mask_and_purge_modal(modal, modal_content)
  }
  // cas: utilisateur clique en dehors de la modale. On la cache, on la vide.
  window.onclick = function(event) {
    if (event.target == "modal") {
      mask_and_purge_modal(modal, modal_content)
    }
  }
}

function mask_and_purge_modal(modal, modal_content) {
  // on masque la modale et on la purge de la balise "p"
  modal.style.display = "none";
  // on ne supprime le dernier objet de la modale seulement si ce n'est pas le bouton close "x"
  if (modal_content.lastElementChild != "[object HTMLSpanElement]") {
    modal_content.lastElementChild.remove();
  }
}

function fetch_get_request(new_movie_id, new_div, is_star_movie=false) {
  if (is_star_movie == false) {
    fetch(`${BASE_URL}/api/v1/titles/${new_movie_id}`)
      .then((response) => response.json())
      .then((responseJSON) => {new_div.innerHTML += fullfill_movie_modal(responseJSON)});
  } else {
    fetch(`${BASE_URL}/api/v1/titles/${new_movie_id}`)
      .then((response) => response.json())
      .then((responseJSON) => {new_div.innerHTML += fullfill_best_movie_modal(responseJSON)});
  }
}

function create_modal(new_movie_id) {
  var modal = document.getElementById("movie_modal");
  var modal_content = document.getElementById("modal-content");
  //  on vérifie que la modale n'est pas déjà fermée
  if (window.getComputedStyle(modal).display === "none") {
    new_div = document.createElement("div");
    new_div.className = "modal_movie_image";
    fetch_get_request(new_movie_id, new_div)


    // on met à jour le contenu de la modale
    modal_content.appendChild(new_div)

    // on affiche  la modale
    modal.style.display = "block";

    // on crée les évènements nécessaires pour la fermeture de la modale
    create_events_for_close_modal(modal, modal_content)
  } else {
    mask_and_purge_modal(modal, modal_content)
  }
}

function instantiate_movie(movie) {
  new_movie = new Movie(
    movie["id"],
    movie["image_url"],
    movie["title"],
    movie["genres"],
    movie["date_published"],
    movie["rated"],
    movie["imdb_score"],
    movie["directors"],
    movie["actors"],
    movie["duration"],
    movie["countries"],
    movie["votes"],
    movie["description"]
  )
  return new_movie;
}

function update_star_movie(star_movie) {
  best_movie = document.getElementById("star_movie");
  best_movie_img = document.createElement("img");
  best_movie_img.id = "star_movie_img_id";
  best_movie.appendChild(best_movie_img);

  star_movie_id = `${star_movie["id"]}`
  movie_a = create_movie_button(star_movie)
  document.getElementById("star_movie").appendChild(movie_a);
  play_best_movie_bt = document.getElementById("play_best_movie_bt")
  play_best_movie_bt.onclick = function() {create_modal(star_movie_id)};
  fetch_get_request(star_movie_id, document.getElementById("star_movie_description"), true)
}

function create_movie_button(new_movie) {
  // sert aux vignettes films. A chaque clique, appel d'une fonction pour créer la modale
  movie_a = document.createElement("button");
  movie_a.type = "button";
  movie_a.id = new_movie['id'];
  movie_a.onclick = function() {create_modal(this.id)};
  movie_image = document.createElement("img");
  movie_image.src = new_movie["image_url"];
  movie_a.appendChild(movie_image);
  return movie_a
}

function update_carroussel(section_name, data, update=false) {
  // c'est la "fonction callback" qu'on appelle après chargement d'une requete réussie par axios
  // c'est elle qui appelera la fonction "update_star_movie" une fois la "catégorie 0" (films les mieux notés) actualisée
  if(update == true) {
    document.getElementById(section_name).innerHTML = "";
  }
  for (movie of data.results) {
    // on va limiter le nombre de films affichés
      // instanciation à minima, 1ère ciconstance d'instantication. Pour le carroussel seules les images sont nécessaires.
      // 1 seul modèle de classe Movie pour 2 circonstances. Là on aura des champs undefined (non utilisés)
      // la 2ème circonstance est au moment de la création de la modale (utilisateur clique sur une vignette de film d'un carroussel)
      // dans cette 2ème circontance la requete GET est spécifique au film et permettra de renseigner tous les attributs de notre classe Movie.
      new_movie = instantiate_movie(movie)

      // on met à jour la structure de données correspondate à la catégorie de film en cours de visualisation
      eval(`${section_name}`).push(new_movie);

      // on met à jour la visualisation. Chaque vignette de film déclenchera l'apparition de la modale (méthode onclick).
      movie_a = create_movie_button(new_movie)
      document.getElementById(`${section_name}`).appendChild(movie_a);
  }
  if (`${section_name}` == "carroussel_categorie_0" && update==false) {
    update_star_movie(eval(`${section_name}[0]`))
  }
}

function get_carroussel_current_page(carroussel_name) {
  // parcours de la structure de données "movies_genre_list". On cherche le numéro de page actuel pour une catégorie (un carroussel).
    for(carroussel of movies_genre_list) {
      if(carroussel["carroussel_name"] == carroussel_name) {
        return carroussel["current_page"]
      }
    }
  }

function get_carroussel_request(carroussel_name) {
  // parcours de la structure de données "movies_genre_list". On cherche le type de requete pour une catégorie (un carroussel).
  for(carroussel of movies_genre_list) {
    if(carroussel["carroussel_name"] == carroussel_name) {
      return carroussel["carroussel_request"]
    }
  }
}

function update_carroussel_current_page(carroussel_name, current_page_number) {
  // parcours de la structure de données "movies_genre_list". On met à jour le numéro de page actuel pour une catégorie (un carroussel).
  for(carroussel of movies_genre_list) {
    if(carroussel["carroussel_name"] == carroussel_name) {
      carroussel["current_page"] = current_page_number;
      return true;
    }
  }
  return false;
}

function axios_get_request(carroussel_name) {
  // axios instancie un objet Prommise.
  // une fois la requete GET réussie, on peut déclencher notre evenement, içi la mise à jour du carroussel d'une catégorie
  axios.get(`${BASE_URL}/api/v1/titles/?${request}&page=${current_page_number}&page_size=${page_size}`)
   .then(response => update_carroussel(carroussel_name,response.data, update=true));
}

function get_next_movies(carroussel_name, modal, modal_content) {
  // fonction assignée à un bouton ">" (prochains) pour executer la mise a jour du carroussel d'une catégorie
  current_page_number = get_carroussel_current_page(carroussel_name)
  current_page_number += 1;
  request = get_carroussel_request(carroussel_name)
  update_carroussel_current_page(carroussel_name, current_page_number)
  mask_and_purge_modal(modal, modal_content)
  axios_get_request(carroussel_name)
}

function get_previous_movies(carroussel_name, modal, modal_content) {
  // fonction assignée à un bouton "<" (precedents) pour executer la mise a jour du carroussel d'une catégorie
  current_page_number = get_carroussel_current_page(carroussel_name)
  if (current_page_number > 1){
    current_page_number -= 1;
  }
  else {
    current_page_number = 1;
  }
  request = get_carroussel_request(carroussel_name)
  update_carroussel_current_page(carroussel_name, current_page_number)
  mask_and_purge_modal(modal, modal_content)
  axios_get_request(carroussel_name)
}

window.onload = function() {
  // la fonction motrice qui charge la logique javascript
  document.getElementById("footer_date").innerHTML = "JustStreamIt " + footer_date.getFullYear();
  var modal = document.getElementById("movie_modal");
  var modal_content = document.getElementById("modal-content");
  // axios est utilsé pour effectuer autant de requetes GET que d'éléments dans la structure de données "movies_genre_list"
  // on utilise le page_size=7 pour obtenir 7 résultats au lieu des 5 par défaut (OCMovies-API-EN-FR/api/v1/titles/pagination.py)
  axios.all(movies_genre_list.map((carroussel) => axios.get(`${BASE_URL}/api/v1/titles/?${carroussel['carroussel_request']}&page=1&page_size=${page_size}`)
    .then(response => update_carroussel(carroussel['carroussel_name'],response.data))));

  // on assigne dynamiquemment des fonctions en utilisant des patterns existantes
  for (let i = 0; i < displayed_categories_number; i++) {
    document.getElementById("right_arrow_categorie_"+i).onclick = function() {get_next_movies("carroussel_categorie_"+i, modal, modal_content)};
    document.getElementById("left_arrow_categorie_"+i).onclick = function() {get_previous_movies("carroussel_categorie_"+i, modal, modal_content)};
  }
}
