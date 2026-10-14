
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");
const clearAllBtn = document.querySelector("#clear-all-btn");

const STORAGE_KEY = "quicknotes-notes";

let notes = loadNotes();

function loadNotes() {
  try {
    const savedNotes = localStorage.getItem(STORAGE_KEY);

    if (!savedNotes) {
      return [];
    }

    const parsedNotes = JSON.parse(savedNotes);

    if (!Array.isArray(parsedNotes)) {
      return [];
    }

    return parsedNotes.filter((note) =>
      note &&
      typeof note.id === "string" &&
      typeof note.text === "string" &&
      ["personal", "work", "study"].includes(note.category) &&
      typeof note.createdAt === "string"
    );
  } catch (error) {
    console.error("Could not load saved notes:", error);
    return [];
  }
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Could not save notes:", error);
    errorMessage.textContent =
      "Unable to save notes in this browser.";
  }
}

function updateCount() {
  const total = notes.length;

  if (total === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (total === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${total} notes.`;
  }
    clearAllBtn.disabled = total === 0;
}

function render() {
  notesList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchTerm)
  );

  if (filteredNotes.length === 0) {
    const message = document.createElement("li");
    message.classList.add("empty-message");

    message.textContent = searchTerm
      ? "No notes match your search."
      : "No notes yet. Add your first note above.";

    notesList.appendChild(message);
  } else {
    filteredNotes.forEach((note) => {
      const card = document.createElement("li");
      card.classList.add(
        "note-card",
        `category-${note.category}`
      );

      const text = document.createElement("p");
      text.classList.add("note-text");
      text.textContent = note.text;

      const meta = document.createElement("div");
      meta.classList.add("note-meta");

      const category = document.createElement("span");
      category.classList.add("category-label");
      category.textContent =
        note.category.charAt(0).toUpperCase() +
        note.category.slice(1);

      const date = document.createElement("time");
      date.textContent = note.createdAt;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.classList.add("delete-btn");
      deleteButton.textContent = "Delete";
      deleteButton.setAttribute(
        "aria-label",
        `Delete note: ${note.text}`
      );

      deleteButton.addEventListener("click", () => {
        deleteNote(note.id);
      });

      meta.append(category, date, deleteButton);
      card.append(text, meta);
      notesList.appendChild(card);
    });
  }

  updateCount();
}

function addNote(text, category) {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (trimmedText.length > 200) {
    errorMessage.textContent =
      "Notes must be 200 characters or fewer.";
    return;
  }

  if (!["personal", "work", "study"].includes(category)) {
    errorMessage.textContent = "Please select a valid category.";
    return;
  }

  const note = {
    id: crypto.randomUUID(),
    text: trimmedText,
    category: category,
    createdAt: new Date().toLocaleString()
  };

  notes.unshift(note);
  saveNotes();

  errorMessage.textContent = "";
  noteInput.value = "";

  render();
  noteInput.focus();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  render();
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addNote(noteInput.value, noteCategory.value);
});

searchInput.addEventListener("input", render);

clearAllBtn.addEventListener("click", () => {
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    errorMessage.textContent = "";
    render();
  }
});

render();
