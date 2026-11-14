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

// Tickets bought through the buy_ticket tool: { [eventId]: quantity }.
const TICKETS_KEY = "webmcp-demo-tickets";

function getTickets() {
  try {
    return JSON.parse(localStorage.getItem(TICKETS_KEY)) || {};
  } catch {
    return {};
  }
}

function getTicketCount(eventId) {
  return getTickets()[eventId] || 0;
}

function addTickets(eventId, quantity) {
  const tickets = getTickets();
  tickets[eventId] = (tickets[eventId] || 0) + quantity;
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  return tickets[eventId];
}
