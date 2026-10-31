// Wishlist and Favorites demo: data is stored in this browser using localStorage.
const STORAGE_KEY = "libraryWishlistFavorites";
const bookGrid = document.getElementById("bookGrid");
const bookDialog = document.getElementById("bookDialog");
const bookForm = document.getElementById("bookForm");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let books = loadBooks();

function loadBooks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function updateStats() {
  document.getElementById("totalCount").textContent = books.length;
  document.getElementById("wishlistCount").textContent = books.filter(book => book.type === "wishlist").length;
  document.getElementById("favoriteCount").textContent = books.filter(book => book.type === "favorite").length;
}

function renderBooks() {
  updateStats();
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;

  const visibleBooks = books.filter(book => {
    const matchesFilter = filter === "all" || book.type === filter;
    const matchesSearch = [book.title, book.author, book.category]
      .some(value => (value || "").toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  bookGrid.replaceChildren();

  if (visibleBooks.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    const heading = document.createElement("strong");
    heading.textContent = books.length === 0 ? "Your collection is empty" : "No matching books found";
    const message = document.createElement("span");
    message.textContent = books.length === 0
      ? "Add a book to your wishlist or favorites to get started."
      : "Try another search or change the filter.";
    empty.append(heading, message);
    bookGrid.appendChild(empty);
    return;
  }

  visibleBooks.forEach(book => {
    const card = document.createElement("article");
    card.className = "book-card";

    const cover = document.createElement("div");
    cover.className = "cover";
    if (book.image) {
      const img = document.createElement("img");
      img.src = book.image;
      img.alt = "Cover of " + book.title;
      img.loading = "lazy";
      img.onerror = () => { cover.replaceChildren(document.createTextNode("📖")); };
      cover.appendChild(img);
    } else {
      cover.textContent = "📖";
    }

    const info = document.createElement("div");
    info.className = "book-info";
    const title = document.createElement("h3");
    title.textContent = book.title;
    const author = document.createElement("p");
    author.className = "author";
    author.textContent = "By " + book.author;
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = book.category || "General";
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = book.type === "favorite" ? "♥ Favorite" : "♡ Wishlist";
    toggle.addEventListener("click", () => toggleType(book.id));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeBook(book.id));

    actions.append(toggle, remove);
    info.append(title, author, category, actions);
    card.append(cover, info);
    bookGrid.appendChild(card);
  });
}

function toggleType(id) {
  books = books.map(book => {
    if (book.id !== id) return book;
    return { ...book, type: book.type === "favorite" ? "wishlist" : "favorite" };
  });
  saveBooks();
  renderBooks();
}

function removeBook(id) {
  books = books.filter(book => book.id !== id);
  saveBooks();
  renderBooks();
}

document.getElementById("addBookBtn").addEventListener("click", () => {
  bookForm.reset();
  document.getElementById("formError").textContent = "";
  bookDialog.showModal();
});

document.getElementById("closeDialog").addEventListener("click", () => bookDialog.close());

bookForm.addEventListener("submit", event => {
  event.preventDefault();
  const title = document.getElementById("bookTitle").value.trim();
  const author = document.getElementById("bookAuthor").value.trim();
  const category = document.getElementById("bookCategory").value.trim();
  const image = document.getElementById("bookImage").value.trim();
  const type = document.getElementById("bookType").value;
  const error = document.getElementById("formError");

  if (!title || !author) {
    error.textContent = "Please enter both the book title and author.";
    return;
  }

  books.unshift({ id: makeId(), title, author, category, image, type });
  saveBooks();
  renderBooks();
  bookDialog.close();
});

searchInput.addEventListener("input", renderBooks);
filterSelect.addEventListener("change", renderBooks);

renderBooks();
