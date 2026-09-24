// Favorites persisted in localStorage. Plain functions, no framework needed.
const FAVORITES_KEY = "webmcp-demo-favorites";

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function isFavorite(eventId) {
  return getFavoriteIds().includes(eventId);
}

function toggleFavorite(eventId) {
  const ids = getFavoriteIds();
  const index = ids.indexOf(eventId);
  if (index === -1) {
    ids.push(eventId);
  } else {
    ids.splice(index, 1);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  return ids.includes(eventId);
}
