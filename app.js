const MEMBER = { id: "m1", name: "Jordan Blake", first: "Jordan" };

const VEHICLES = [
  { id: "sedan", name: "Executive Sedan", blurb: "A quiet cabin for three.", seats: 3, rate: 95, tag: "City" },
  { id: "stretch", name: "Stretch Limousine", blurb: "An evening, properly stretched.", seats: 8, rate: 180, tag: "Signature" },
  { id: "suv", name: "Grand SUV", blurb: "Room for luggage and a small party.", seats: 6, rate: 140, tag: "Airport" },
  { id: "coach", name: "Salon Coach", blurb: "For the full party.", seats: 14, rate: 260, tag: "Events" }
];

const DRIVERS = [
  { id: "d1", name: "Marcus Hale", vehicleId: "stretch" },
  { id: "d2", name: "Elena Voss", vehicleId: "suv" },
  { id: "d3", name: "Jonah Park", vehicleId: "sedan" },
  { id: "d4", name: "Amira Cole", vehicleId: "coach" }
];

const NOTES = ["On the way", "Traffic is light", "Holding a smooth pace", "Nearing the destination"];
const OCCASIONS = ["Airport", "Evening", "Event", "Corporate", "Other"];
const PLACES = [
  "The St. Regis",
  "The Plaza",
  "Waldorf Astoria",
  "JFK Terminal 4",
  "LaGuardia",
  "Teterboro",
  "Hudson Yards",
  "Lincoln Center",
  "SoHo House",
  "The Mark",
  "Brooklyn Botanic Garden",
  "Midtown Heliport"
];

const STATUS = {
  requested: "Requested",
  confirmed: "Confirmed",
  assigned: "Chauffeur set",
  enroute: "En route",
  arrived: "Arrived",
  completed: "Completed",
  cancelled: "Cancelled"
};

const FLOW = ["requested", "confirmed", "assigned", "enroute", "arrived", "completed"];
const KEY = "meridian-demo-v1";
const SESSION = "meridian-session";
const TURNAROUND_MS = 3 * 60 * 60 * 1000;

const confirmTimers = new Map();
let toastTimer = 0;
let liveTimer = 0;

function minsAgo(minutes) {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function hoursAhead(hours) {
  return new Date(Date.now() + hours * 3600000).toISOString();
}

function seed() {
  return {
    bookings: [
      {
        id: "MR-1840",
        guestId: "m1",
        guestName: "Jordan Blake",
        pickup: "The St. Regis",
        dropoff: "JFK Terminal 4",
        when: minsAgo(18),
        vehicleId: "stretch",
        guests: 2,
        occasion: "Airport",
        notes: "",
        status: "enroute",
        driverId: "d1",
        eta: 9,
        note: "Holding a smooth pace",
        noteIndex: 2,
        history: [
          { status: "requested", at: minsAgo(48) },
          { status: "confirmed", at: minsAgo(40) },
          { status: "assigned", at: minsAgo(28) },
          { status: "enroute", at: minsAgo(12) }
        ]
      },
      {
        id: "MR-1852",
        guestId: "g2",
        guestName: "Adrian Cho",
        pickup: "Hudson Yards",
        dropoff: "Lincoln Center",
        when: hoursAhead(7),
        vehicleId: "sedan",
        guests: 2,
        occasion: "Corporate",
        notes: "",
        status: "requested",
        driverId: null,
        eta: null,
        note: "",
        noteIndex: 0,
        history: [{ status: "requested", at: minsAgo(35) }]
      },
      {
        id: "MR-1858",
        guestId: "g3",
        guestName: "Camille Laurent",
        pickup: "Waldorf Astoria",
        dropoff: "Teterboro",
        when: hoursAhead(26),
        vehicleId: "sedan",
        guests: 2,
        occasion: "Airport",
        notes: "",
        status: "assigned",
        driverId: "d3",
        eta: null,
        note: "",
        noteIndex: 0,
        history: [
          { status: "requested", at: hoursAhead(-20) },
          { status: "confirmed", at: hoursAhead(-18) },
          { status: "assigned", at: hoursAhead(-6) }
        ]
      },
      {
        id: "MR-1864",
        guestId: "m1",
        guestName: "Jordan Blake",
        pickup: "The Plaza",
        dropoff: "Brooklyn Botanic Garden",
        when: hoursAhead(32),
        vehicleId: "coach",
        guests: 10,
        occasion: "Event",
        notes: "Garden entrance, please.",
        status: "confirmed",
        driverId: null,
        eta: null,
        note: "",
        noteIndex: 0,
        history: [
          { status: "requested", at: hoursAhead(-5) },
          { status: "confirmed", at: hoursAhead(-4) }
        ]
      },
      {
        id: "MR-1822",
        guestId: "m1",
        guestName: "Jordan Blake",
        pickup: "SoHo House",
        dropoff: "The Mark",
        when: hoursAhead(-26),
        vehicleId: "suv",
        guests: 2,
        occasion: "Evening",
        notes: "",
        status: "completed",
        driverId: "d2",
        eta: null,
        note: "",
        noteIndex: 0,
        history: [
          { status: "requested", at: hoursAhead(-30) },
          { status: "confirmed", at: hoursAhead(-29) },
          { status: "assigned", at: hoursAhead(-28) },
          { status: "completed", at: hoursAhead(-24) }
        ]
      }
    ],
    activity: [
      { id: "a1", text: "MR-1840 · Jordan Blake is now En route", at: minsAgo(12) },
      { id: "a2", text: "MR-1840 · Marcus Hale is at the wheel", at: minsAgo(28) },
      { id: "a3", text: "MR-1852 · Adrian Cho requested a sedan", at: minsAgo(35) },
      { id: "a4", text: "MR-1864 · request confirmed", at: hoursAhead(-4) }
    ]
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.bookings)) return seed();
    if (!Array.isArray(data.activity)) data.activity = [];
    data.bookings.forEach((booking) => {
      if (!Array.isArray(booking.history)) booking.history = [];
    });
    return data;
  } catch (err) {
    return seed();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state.data));
  } catch (err) {
    /* Demo keeps working in memory if storage is blocked. */
  }
}

function readSession() {
  try {
    return sessionStorage.getItem(SESSION) === "1";
  } catch (err) {
    return false;
  }
}

function toDateInput(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function defaultDraft() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return {
    pickup: "",
    dropoff: "",
    date: toDateInput(date),
    time: "19:00",
    occasion: "Evening",
    notes: ""
  };
}

const state = {
  user: readSession() ? MEMBER : null,
  entering: false,
  role: "rider",
  view: "book",
  vehicleId: "stretch",
  guests: 2,
  draft: defaultDraft(),
  toast: "",
  flashId: "",
  pendingCancel: "",
  formError: "",
  boardFilter: "all",
  dayOffset: 0,
  saving: false,
  renderedView: "",
  data: load()
};

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function vehicleById(id) {
  return VEHICLES.find((vehicle) => vehicle.id === id) || VEHICLES[0];
}

function driverById(id) {
  return DRIVERS.find((driver) => driver.id === id) || null;
}

function bookingById(id) {
  return state.data.bookings.find((booking) => booking.id === id) || null;
}

function guestWord(count) {
  return `${count} guest${count === 1 ? "" : "s"}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function clock(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function dayLabel(iso) {
  const date = new Date(iso);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((day - start) / 86400000);
  const time = clock(iso);
  if (diff === 0) return `Today · ${time}`;
  if (diff === 1) return `Tomorrow · ${time}`;
  if (diff === -1) return `Yesterday · ${time}`;
  const formatted = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return `${formatted} · ${time}`;
}

function dayKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dateFromOffset(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

function longDate(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function etaLabel(minutes) {
  return `${Math.max(1, Number(minutes) || 1)} min`;
}

function liveNote(booking) {
  const name = driverById(booking.driverId)?.name || "Chauffeur";
  if (booking.status === "arrived") return `${name} · Arrived`;
  if ((booking.eta || 0) <= 2) return `${name} · At the curb`;
  return `${name} · ${booking.note || "On the way"}`;
}

function byAttention(a, b) {
  const rank = { enroute: 0, arrived: 1, assigned: 2, confirmed: 3, requested: 4, completed: 5, cancelled: 6 };
  const delta = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
  if (delta) return delta;
  return new Date(a.when) - new Date(b.when);
}

function myTrips() {
  return state.data.bookings.filter((booking) => booking.guestId === MEMBER.id).sort(byAttention);
}

function activeTrip() {
  return myTrips().find((booking) => booking.status === "enroute" || booking.status === "arrived") || null;
}

function activityItem(text, at) {
  return {
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    at: at || new Date().toISOString()
  };
}

function trimActivity() {
  state.data.activity = state.data.activity.slice(0, 14);
}

function applyStatus(booking, status, text) {
  booking.status = status;
  booking.history = booking.history || [];
  booking.history.push({ status, at: new Date().toISOString() });
  if (status === "enroute") {
    booking.eta = booking.eta && booking.eta > 1 ? booking.eta : 12;
    booking.note = booking.note || "On the way";
  }
  state.data.activity.unshift(activityItem(text || `${booking.id} · ${booking.guestName} is now ${STATUS[status]}`));
  trimActivity();
}

function clashes(driverId, when, ignoreId) {
  const time = new Date(when).getTime();
  return state.data.bookings.find((booking) => {
    if (booking.id === ignoreId || booking.driverId !== driverId) return false;
    if (booking.status === "cancelled" || booking.status === "completed") return false;
    return Math.abs(new Date(booking.when).getTime() - time) < TURNAROUND_MS;
  });
}

function nextId() {
  const nums = state.data.bookings.map((booking) => Number(String(booking.id).replace(/\D/g, "")) || 0);
  return `MR-${Math.max(1840, ...nums) + 1}`;
}

function notify(message) {
  save();
  state.toast = message;
  render();
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = "";
    const toast = document.querySelector(".toast");
    if (toast) toast.remove();
  }, 3200);
}

function scheduleAutoConfirm(id) {
  window.clearTimeout(confirmTimers.get(id));
  const timer = window.setTimeout(() => {
    confirmTimers.delete(id);
    const booking = bookingById(id);
    if (!booking || booking.status !== "requested") return;
    applyStatus(booking, "confirmed", `${booking.id} · request confirmed`);
    state.flashId = booking.id;
    notify("Reservation confirmed");
  }, 2400);
  confirmTimers.set(id, timer);
}

function captureDraft() {
  const form = document.getElementById("book-form");
  if (!form) return;
  const data = new FormData(form);
  state.draft = {
    pickup: String(data.get("pickup") || ""),
    dropoff: String(data.get("dropoff") || ""),
    date: String(data.get("date") || ""),
    time: String(data.get("time") || ""),
    occasion: String(data.get("occasion") || "Evening"),
    notes: String(data.get("notes") || "")
  };
}

function draftWhenLabel() {
  if (!state.draft.date || !state.draft.time) return "Set a time";
  const when = new Date(`${state.draft.date}T${state.draft.time}:00`);
  if (Number.isNaN(when.getTime())) return "Set a time";
  return dayLabel(when.toISOString());
}

function summaryModel() {
  const vehicle = vehicleById(state.vehicleId);
  const pickup = state.draft.pickup.trim();
  const dropoff = state.draft.dropoff.trim();
  return {
    route: pickup && dropoff ? `${pickup} → ${dropoff}` : "Pickup and destination",
    when: draftWhenLabel(),
    vehicle: vehicle.name,
    guests: guestWord(state.guests),
    rate: `From $${vehicle.rate} / hour`,
    occasion: state.draft.occasion || "Evening"
  };
}

function paintSummary() {
  const summary = summaryModel();
  const pairs = {
    "[data-sum-route]": summary.route,
    "[data-sum-when]": summary.when,
    "[data-sum-vehicle]": summary.vehicle,
    "[data-sum-guests]": summary.guests,
    "[data-sum-occasion]": summary.occasion,
    "[data-sum-rate]": summary.rate
  };
  Object.entries(pairs).forEach(([selector, text]) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = text;
  });
}

function setGuests(next) {
  captureDraft();
  const cap = vehicleById(state.vehicleId).seats;
  state.guests = Math.max(1, Math.min(cap, next));
  const count = document.querySelector("[data-guests]");
  const hint = document.querySelector("[data-cap]");
  const minus = document.querySelector('[data-guest="minus"]');
  const plus = document.querySelector('[data-guest="plus"]');
  if (count) count.textContent = String(state.guests);
  if (hint) hint.textContent = `Up to ${cap} in this car.`;
  if (minus) minus.disabled = state.guests <= 1;
  if (plus) plus.disabled = state.guests >= cap;
  paintSummary();
}

function selectVehicle(id) {
  const vehicle = VEHICLES.find((item) => item.id === id);
  if (!vehicle) return;
  captureDraft();
  state.vehicleId = id;
  document.querySelectorAll("[data-vehicle]").forEach((button) => {
    const on = button.dataset.vehicle === id;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
  setGuests(Math.min(state.guests, vehicle.seats));
}

function mark() {
  return `<svg class="mark" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5 18.7 12.2 28.5 16 18.7 19.8 16 29.5 13.3 19.8 3.5 16 13.3 12.2Z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
}

function loginView() {
  return `
    <div class="login">
      <section class="login-brand" aria-hidden="false">
        <div class="login-copy">
          <p class="eyebrow">Private chauffeur</p>
          <h1>Arrive in<br><em>your own time.</em></h1>
          <p>Meridian keeps the car, the chauffeur, and the reservation status in one quiet place.</p>
          <ol class="principles">
            <li><b>01</b> Sedans for the city</li>
            <li><b>02</b> Stretches for the evening</li>
            <li><b>03</b> Coaches for the full party</li>
          </ol>
        </div>
      </section>
      <section class="login-panel" id="main">
        <form class="panel-card" id="login-form" autocomplete="off">
          <p class="eyebrow">Member access</p>
          <h2>Welcome back</h2>
          <p class="fine">Access is already filled in. Enter when you are ready.</p>
          <label class="field">
            <span>Member ID</span>
            <input class="mask" type="text" name="member-display" readonly autocomplete="off" value="********" aria-label="Saved member ID">
          </label>
          <label class="field">
            <span>Passcode</span>
            <input class="mask" type="text" name="passcode-display" readonly autocomplete="off" value="********" aria-label="Saved passcode">
          </label>
          <button class="btn btn-block" type="submit" ${state.entering ? "disabled" : ""}>${state.entering ? "One moment" : "Enter"}</button>
        </form>
      </section>
    </div>
  `;
}

function navButtons() {
  const items = state.role === "rider"
    ? [["book", "Reserve"], ["trips", "Trips"]]
    : [["board", "Board"], ["schedule", "Schedule"]];
  return items.map(([view, label]) => {
    const current = state.view === view ? ' aria-current="page"' : "";
    return `<button type="button" data-action="nav" data-view="${view}"${current}>${label}</button>`;
  }).join("");
}

function appShell() {
  const riderViews = ["book", "trips"];
  const deskViews = ["board", "schedule"];
  const allowed = state.role === "rider" ? riderViews : deskViews;
  if (!allowed.includes(state.view)) state.view = allowed[0];

  return `
    <div class="shell">
      <header class="topbar-wrap">
        <div class="topbar">
          <div class="brand-cluster">
            <div class="brand">${mark()}<span class="word">Meridian</span></div>
            <span class="live"><i aria-hidden="true"></i> Live</span>
          </div>
          <nav class="tabs" aria-label="Sections">${navButtons()}</nav>
          <div class="switch" role="tablist" aria-label="Workspace">
            <button type="button" role="tab" data-action="role" data-role="rider" aria-selected="${state.role === "rider"}">Guest</button>
            <button type="button" role="tab" data-action="role" data-role="dispatch" aria-selected="${state.role === "dispatch"}">Dispatch</button>
          </div>
          <button type="button" class="signout" data-action="logout">Sign out</button>
        </div>
      </header>
      <main id="main" class="app-main">${currentView()}</main>
      <nav class="dock" aria-label="Sections">${navButtons()}</nav>
      ${state.toast ? `<div class="toast" role="status">${esc(state.toast)}</div>` : ""}
    </div>
  `;
}

function currentView() {
  if (state.role === "rider") return state.view === "trips" ? tripsView() : bookView();
  return state.view === "schedule" ? scheduleView() : boardView();
}

function occasionOptions() {
  return OCCASIONS.map((name) => {
    const selected = name === state.draft.occasion ? " selected" : "";
    return `<option value="${esc(name)}"${selected}>${esc(name)}</option>`;
  }).join("");
}

function placeOptions() {
  return PLACES.map((place) => `<option value="${esc(place)}"></option>`).join("");
}

function summaryHtml() {
  const summary = summaryModel();
  return `
    <aside class="summary">
      <p class="eyebrow">This request</p>
      <p class="sum-route" data-sum-route>${esc(summary.route)}</p>
      <div class="sum-list">
        <div><span>When</span><strong data-sum-when>${esc(summary.when)}</strong></div>
        <div><span>Car</span><strong data-sum-vehicle>${esc(summary.vehicle)}</strong></div>
        <div><span>Guests</span><strong data-sum-guests>${esc(summary.guests)}</strong></div>
        <div><span>Occasion</span><strong data-sum-occasion>${esc(summary.occasion)}</strong></div>
        <div><span>Guide</span><strong data-sum-rate>${esc(summary.rate)}</strong></div>
      </div>
      <p class="hint">For ${esc(MEMBER.name)}. The desk confirms the chauffeur in the app.</p>
    </aside>
  `;
}

function bookView() {
  const vehicle = vehicleById(state.vehicleId);
  const today = toDateInput(new Date());
  const fleet = VEHICLES.map((item) => {
    const on = item.id === state.vehicleId;
    return `
      <button type="button" class="vehicle${on ? " is-on" : ""}" data-action="vehicle" data-vehicle="${item.id}" aria-pressed="${on}">
        <span class="tag">${esc(item.tag)}</span>
        <strong>${esc(item.name)}</strong>
        <em>${esc(item.blurb)}</em>
        <span class="meta">${item.seats} seats · $${item.rate}/hr</span>
      </button>
    `;
  }).join("");

  return `
    <section class="view">
      <div class="page-head">
        <h1>${esc(greeting())},<br><em>${esc(MEMBER.first)}</em></h1>
        <p class="lede">Tell us where to be. Status stays live from the request to the curb.</p>
      </div>
      ${liveCard(activeTrip())}
      <form id="book-form" class="book-grid" autocomplete="off">
        <div class="book-fields">
          <label class="field">
            <span>Pickup</span>
            <input type="text" name="pickup" required maxlength="80" list="places" spellcheck="false" placeholder="Hotel, address, or airport" value="${esc(state.draft.pickup)}">
          </label>
          <label class="field">
            <span>Destination</span>
            <input type="text" name="dropoff" required maxlength="80" list="places" spellcheck="false" placeholder="Where should we arrive" value="${esc(state.draft.dropoff)}">
          </label>
          <datalist id="places">${placeOptions()}</datalist>
          <div class="pair">
            <label class="field">
              <span>Date</span>
              <input type="date" name="date" required min="${today}" value="${esc(state.draft.date)}">
            </label>
            <label class="field">
              <span>Time</span>
              <input type="time" name="time" required value="${esc(state.draft.time)}">
            </label>
          </div>
          <label class="field">
            <span>Occasion</span>
            <select name="occasion">${occasionOptions()}</select>
          </label>
          <h2 class="section-title">Choose a car</h2>
          <div class="fleet" role="group" aria-label="Vehicle">${fleet}</div>
          <div class="guest-row">
            <div>
              <span class="label">Guests</span>
              <p class="hint" data-cap>Up to ${vehicle.seats} in this car.</p>
            </div>
            <div class="stepper">
              <button type="button" data-action="guests" data-dir="-1" data-guest="minus" aria-label="Fewer guests" ${state.guests <= 1 ? "disabled" : ""}>−</button>
              <strong data-guests aria-live="polite">${state.guests}</strong>
              <button type="button" data-action="guests" data-dir="1" data-guest="plus" aria-label="More guests" ${state.guests >= vehicle.seats ? "disabled" : ""}>+</button>
            </div>
          </div>
          <label class="field">
            <span>Note for the chauffeur</span>
            <textarea name="notes" maxlength="240" placeholder="Optional">${esc(state.draft.notes)}</textarea>
          </label>
          <p class="hint">Suggestions appear as you type a place.</p>
        </div>
        ${summaryHtml()}
        <div class="book-submit">
          ${state.formError ? `<p class="form-error" role="alert">${esc(state.formError)}</p>` : ""}
          <button class="btn" type="submit">Request reservation</button>
        </div>
      </form>
    </section>
  `;
}

function liveCard(booking) {
  if (!booking) return "";
  const moving = booking.status === "enroute";
  return `
    <button type="button" class="live-card" data-action="nav" data-view="trips">
      <div class="live-top">
        <span class="pill pill-${booking.status} is-live"><i aria-hidden="true"></i>${esc(STATUS[booking.status])}</span>
        <strong class="eta"${moving ? ` data-eta="${booking.id}"` : ""}>${moving ? esc(etaLabel(booking.eta)) : "Here"}</strong>
      </div>
      <div class="stops">
        <div><span>From</span><strong>${esc(booking.pickup)}</strong></div>
        <div class="rail" aria-hidden="true"></div>
        <div><span>To</span><strong>${esc(booking.dropoff)}</strong></div>
      </div>
      <p class="live-line" data-note="${booking.id}">${esc(liveNote(booking))}</p>
    </button>
  `;
}

function progressHtml(booking) {
  if (booking.status === "cancelled") return "";
  const index = FLOW.indexOf(booking.status);
  const pct = Math.round(((index + 1) / FLOW.length) * 100);
  return `<div class="bar" aria-hidden="true"><span style="--p:${pct}%"></span></div>`;
}

function historyHtml(booking) {
  const items = (booking.history || []).slice(-5);
  if (!items.length) return "";
  return `<ol class="log">${items.map((entry) => `<li><span>${esc(STATUS[entry.status] || entry.status)}</span><time>${esc(clock(entry.at))}</time></li>`).join("")}</ol>`;
}

function metaLine(booking) {
  const vehicle = vehicleById(booking.vehicleId);
  return [dayLabel(booking.when), vehicle.name, guestWord(booking.guests), booking.occasion].filter(Boolean).join(" · ");
}

function pickHtml(booking, driver) {
  const clash = clashes(driver.id, booking.when, booking.id);
  const on = booking.driverId === driver.id;
  const fit = driver.vehicleId === booking.vehicleId && !clash;
  let sub = vehicleById(driver.vehicleId).name;
  if (clash && !on) sub = "Booked nearby";
  else if (fit) sub = "Best fit";
  return `
    <button type="button" class="pick${on ? " is-on" : ""}${fit ? " is-fit" : ""}" data-action="assign" data-id="${booking.id}" data-driver="${driver.id}" ${clash && !on ? "disabled" : ""}>
      <strong>${esc(driver.name)}</strong>
      <span>${esc(sub)}</span>
    </button>
  `;
}

function deskActions(booking) {
  if (booking.status === "completed" || booking.status === "cancelled") return "";
  const labels = {
    requested: "Confirm request",
    assigned: "Mark en route",
    enroute: "Mark arrived",
    arrived: "Complete trip"
  };
  const label = labels[booking.status];
  const drivers = [...DRIVERS].sort((a, b) => {
    const aFit = a.vehicleId === booking.vehicleId ? 0 : 1;
    const bFit = b.vehicleId === booking.vehicleId ? 0 : 1;
    return aFit - bFit;
  });
  const needsDriver = !booking.driverId;
  return `
    ${needsDriver ? `<p class="hint">Choose a chauffeur to place them on the trip.</p>` : ""}
    <div class="picks">${drivers.map((driver) => pickHtml(booking, driver)).join("")}</div>
    <div class="actions">
      ${label ? `<button type="button" class="btn" data-action="advance" data-id="${booking.id}">${label}</button>` : ""}
      ${booking.status === "assigned" ? `<button type="button" class="btn-ghost" data-action="release" data-id="${booking.id}">Release chauffeur</button>` : ""}
    </div>
  `;
}

function cancelHtml(booking, mode) {
  const guestCan = ["requested", "confirmed", "assigned"].includes(booking.status);
  const deskCan = !["completed", "cancelled"].includes(booking.status);
  if (mode === "guest" ? !guestCan : !deskCan) return "";
  if (state.pendingCancel === booking.id) {
    return `
      <div class="confirm-row">
        <p>Cancel this reservation?</p>
        <button type="button" class="btn-ghost" data-action="keep">Keep it</button>
        <button type="button" class="btn" data-action="confirm-cancel" data-id="${booking.id}">Cancel it</button>
      </div>
    `;
  }
  return `<button type="button" class="btn-text" data-action="ask-cancel" data-id="${booking.id}">Cancel reservation</button>`;
}

function bookingCard(booking, mode) {
  const quiet = booking.status === "cancelled" ? " is-quiet" : "";
  const flash = state.flashId === booking.id ? " flash" : "";
  const moving = booking.status === "enroute";
  return `
    <article class="card${quiet}${flash}" data-booking="${booking.id}">
      <div class="card-top">
        <span class="id">${esc(booking.id)}</span>
        <span class="pill pill-${booking.status}${moving ? " is-live" : ""}"><i aria-hidden="true"></i>${esc(STATUS[booking.status])}</span>
      </div>
      ${mode === "desk" ? `<p class="kicker">${esc(booking.guestName)}</p>` : ""}
      <h2 class="route-title"><span>${esc(booking.pickup)}</span> <em>to</em> <span>${esc(booking.dropoff)}</span></h2>
      <p class="meta">${esc(metaLine(booking))}</p>
      <p class="driver-line">${esc(driverById(booking.driverId)?.name || "Chauffeur not set")}${moving ? ` · <span data-eta="${booking.id}">${esc(etaLabel(booking.eta))}</span>` : ""}</p>
      ${booking.notes ? `<p class="hint">${esc(booking.notes)}</p>` : ""}
      ${progressHtml(booking)}
      ${mode === "guest" ? historyHtml(booking) : ""}
      ${mode === "guest" && (moving || booking.status === "arrived") ? `<p class="live-line" data-note="${booking.id}">${esc(liveNote(booking))}</p>` : ""}
      ${mode === "desk" ? deskActions(booking) : ""}
      ${cancelHtml(booking, mode)}
    </article>
  `;
}

function emptyState(title, copy) {
  return `<div class="empty"><h2>${esc(title)}</h2><p>${esc(copy)}</p></div>`;
}

function tripsView() {
  const trips = myTrips();
  return `
    <section class="view">
      <div class="page-head">
        <h1>Trips</h1>
        <p class="lede">Each reservation stays current while the desk and your chauffeur move.</p>
      </div>
      ${trips.length ? `<div class="stack stagger">${trips.map((booking) => bookingCard(booking, "guest")).join("")}</div>` : emptyState("No trips yet", "Reserve a car and it will show up here.")}
    </section>
  `;
}

function boardView() {
  const all = state.data.bookings;
  const counts = {
    all: all.length,
    open: all.filter((booking) => booking.status === "requested" || booking.status === "confirmed").length,
    active: all.filter((booking) => ["assigned", "enroute", "arrived"].includes(booking.status)).length,
    done: all.filter((booking) => booking.status === "completed" || booking.status === "cancelled").length
  };
  const onRoad = all.filter((booking) => booking.status === "enroute" || booking.status === "arrived").length;
  const free = DRIVERS.filter((driver) => !all.some((booking) => booking.driverId === driver.id && (booking.status === "enroute" || booking.status === "arrived"))).length;
  const filters = [
    ["all", `All ${counts.all}`],
    ["open", `Open ${counts.open}`],
    ["active", `Active ${counts.active}`],
    ["done", `Done ${counts.done}`]
  ];
  const visible = [...all].sort((a, b) => new Date(a.when) - new Date(b.when)).filter((booking) => {
    if (state.boardFilter === "open") return booking.status === "requested" || booking.status === "confirmed";
    if (state.boardFilter === "active") return ["assigned", "enroute", "arrived"].includes(booking.status);
    if (state.boardFilter === "done") return booking.status === "completed" || booking.status === "cancelled";
    return true;
  });
  const feed = state.data.activity.slice(0, 8);

  return `
    <section class="view">
      <div class="page-head">
        <h1>Dispatch</h1>
        <p class="lede">Confirm requests, set chauffeurs, and move the status. Guests see the change live.</p>
      </div>
      <div class="stats">
        <div class="stat"><span>Open requests</span><strong>${counts.open}</strong></div>
        <div class="stat"><span>On the road</span><strong>${onRoad}</strong></div>
        <div class="stat"><span>Chauffeurs free</span><strong>${free}</strong></div>
      </div>
      <div class="desk-grid">
        <div>
          <div class="chips">
            ${filters.map(([id, label]) => `<button type="button" class="chip${state.boardFilter === id ? " is-on" : ""}" data-action="filter" data-filter="${id}">${label}</button>`).join("")}
          </div>
          ${visible.length ? `<div class="stack" style="margin-top:14px">${visible.map((booking) => bookingCard(booking, "desk")).join("")}</div>` : emptyState("Nothing in this lane", "Try another filter, or wait for the next request.")}
          <div class="foot"><button type="button" class="btn-text" data-action="reset">Restore sample day</button></div>
        </div>
        <aside class="activity">
          <h2 class="section-title">Live desk</h2>
          ${feed.length ? `<ul>${feed.map((item) => `<li><time>${esc(clock(item.at))}</time><span>${esc(item.text)}</span></li>`).join("")}</ul>` : `<p class="hint">Quiet for the moment.</p>`}
        </aside>
      </div>
    </section>
  `;
}

function jobRow(booking) {
  return `
    <div class="job">
      <div>
        <span class="id">${esc(booking.id)}</span>
        <strong>${esc(booking.pickup)} to ${esc(booking.dropoff)}</strong>
        <p class="hint">${esc(dayLabel(booking.when))} · ${esc(booking.guestName)} · ${esc(STATUS[booking.status])}</p>
      </div>
      ${booking.status === "assigned" ? `<button type="button" class="btn-ghost" data-action="release" data-id="${booking.id}">Release</button>` : ""}
    </div>
  `;
}

function roster(driver, onDay) {
  const jobs = onDay.filter((booking) => booking.driverId === driver.id).sort((a, b) => new Date(a.when) - new Date(b.when));
  const busy = jobs.some((booking) => booking.status === "enroute" || booking.status === "arrived");
  const cls = busy ? "pill-enroute is-live" : jobs.length ? "pill-assigned" : "pill-confirmed";
  const label = busy ? "On a trip" : jobs.length ? "Scheduled" : "Open";
  return `
    <div class="driver">
      <div class="driver-head">
        <div>
          <strong>${esc(driver.name)}</strong>
          <p class="hint">${esc(vehicleById(driver.vehicleId).name)}</p>
        </div>
        <span class="pill ${cls}"><i aria-hidden="true"></i>${label}</span>
      </div>
      ${jobs.length ? jobs.map(jobRow).join("") : `<p class="hint">Nothing on the book.</p>`}
    </div>
  `;
}

function scheduleView() {
  const day = dateFromOffset(state.dayOffset);
  const key = dayKey(day);
  const onDay = state.data.bookings.filter((booking) => dayKey(booking.when) === key && booking.status !== "cancelled");
  const waiting = onDay.filter((booking) => !booking.driverId && booking.status !== "completed").sort((a, b) => new Date(a.when) - new Date(b.when));
  const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const date = dateFromOffset(offset);
    const on = offset === state.dayOffset;
    return `<button type="button" class="day${on ? " is-on" : ""}" data-action="day" data-offset="${offset}" aria-pressed="${on}"><span>${date.toLocaleDateString("en-US", { weekday: "short" })}</span><strong>${date.getDate()}</strong></button>`;
  }).join("");

  return `
    <section class="view">
      <div class="page-head">
        <h1>Schedule</h1>
        <p class="lede">${esc(longDate(day))}. Chauffeurs and the trips on their book.</p>
      </div>
      <div class="days">${days}</div>
      ${onDay.length ? "" : `<p class="hint">No reservations this day.</p>`}
      ${waiting.length ? `<h2 class="section-title">Needs a chauffeur</h2><div class="stack">${waiting.map((booking) => bookingCard(booking, "desk")).join("")}</div>` : onDay.length ? `<p class="hint">Every trip this day has a chauffeur.</p>` : ""}
      <h2 class="section-title">Chauffeurs</h2>
      <div class="roster">${DRIVERS.map((driver) => roster(driver, onDay)).join("")}</div>
      <div class="foot"><button type="button" class="btn-text" data-action="reset">Restore sample day</button></div>
    </section>
  `;
}

function render() {
  const root = document.getElementById("app");
  const token = state.user ? `${state.role}:${state.view}` : "login";
  root.innerHTML = state.user ? appShell() : loginView();
  if (token !== state.renderedView) {
    window.scrollTo(0, 0);
    state.renderedView = token;
  }
}

function go(view) {
  captureDraft();
  state.formError = "";
  state.pendingCancel = "";
  if (state.view === view) return;
  state.view = view;
  render();
}

function setRole(role) {
  if (role !== "rider" && role !== "dispatch") return;
  if (role === state.role) return;
  captureDraft();
  state.formError = "";
  state.pendingCancel = "";
  state.role = role;
  state.view = role === "rider" ? "book" : "board";
  render();
}

function enter() {
  if (state.entering) return;
  state.entering = true;
  render();
  window.setTimeout(() => {
    state.user = MEMBER;
    state.entering = false;
    state.role = "rider";
    state.view = "book";
    try {
      sessionStorage.setItem(SESSION, "1");
    } catch (err) {
      /* Session can stay in memory. */
    }
    render();
  }, 500);
}

function logout() {
  state.user = null;
  state.entering = false;
  try {
    sessionStorage.removeItem(SESSION);
  } catch (err) {
    /* Ignore storage failures. */
  }
  render();
}

function createBooking() {
  if (state.saving) return;
  state.saving = true;
  captureDraft();
  const pickup = state.draft.pickup.trim();
  const dropoff = state.draft.dropoff.trim();
  const occasion = OCCASIONS.includes(state.draft.occasion) ? state.draft.occasion : "Evening";
  const notes = state.draft.notes.trim();
  const when = new Date(`${state.draft.date}T${state.draft.time}:00`);

  const fail = (message) => {
    state.formError = message;
    state.saving = false;
    render();
  };

  if (pickup.length < 2 || dropoff.length < 2) return fail("Add a pickup and a destination.");
  if (pickup.toLowerCase() === dropoff.toLowerCase()) return fail("Pickup and destination should differ.");
  if (Number.isNaN(when.getTime())) return fail("Check the date and time.");
  if (when.getTime() < Date.now() - 60000) return fail("Choose a later departure.");

  const booking = {
    id: nextId(),
    guestId: MEMBER.id,
    guestName: MEMBER.name,
    pickup,
    dropoff,
    when: when.toISOString(),
    vehicleId: state.vehicleId,
    guests: Math.max(1, Math.min(vehicleById(state.vehicleId).seats, state.guests)),
    occasion,
    notes,
    status: "requested",
    driverId: null,
    eta: null,
    note: "",
    noteIndex: 0,
    history: [{ status: "requested", at: new Date().toISOString() }]
  };

  state.data.bookings.push(booking);
  state.data.activity.unshift(activityItem(`${booking.id} · ${booking.guestName} requested a car`));
  trimActivity();
  scheduleAutoConfirm(booking.id);
  state.draft = defaultDraft();
  state.guests = 2;
  state.vehicleId = "stretch";
  state.formError = "";
  state.view = "trips";
  state.flashId = booking.id;
  state.saving = false;
  notify("Request received");
}

function assign(bookingId, driverId) {
  const booking = bookingById(bookingId);
  const driver = driverById(driverId);
  if (!booking || !driver) return;
  if (booking.status === "completed" || booking.status === "cancelled") return;
  if (booking.driverId === driverId) return;
  if (clashes(driverId, booking.when, booking.id)) {
    notify(`${driver.name} already has a trip within three hours`);
    return;
  }
  booking.driverId = driverId;
  if (booking.status === "requested" || booking.status === "confirmed") {
    applyStatus(booking, "assigned", `${booking.id} · ${driver.name} is at the wheel`);
  } else {
    state.data.activity.unshift(activityItem(`${booking.id} · chauffeur is now ${driver.name}`));
    trimActivity();
  }
  state.flashId = booking.id;
  notify(`${driver.name} is set on ${booking.id}`);
}

function advance(id) {
  const booking = bookingById(id);
  if (!booking) return;
  const next = { requested: "confirmed", assigned: "enroute", enroute: "arrived", arrived: "completed" }[booking.status];
  if (!next) return;
  if (next === "enroute" && !booking.driverId) {
    notify("Assign a chauffeur first");
    return;
  }
  applyStatus(booking, next);
  state.flashId = booking.id;
  notify(`${booking.id} · ${STATUS[next]}`);
}

function release(id) {
  const booking = bookingById(id);
  if (!booking || !booking.driverId) return;
  if (booking.status !== "assigned") {
    notify("This trip is already underway");
    return;
  }
  const name = driverById(booking.driverId)?.name || "Chauffeur";
  booking.driverId = null;
  applyStatus(booking, "confirmed", `${booking.id} · ${name} released`);
  state.flashId = booking.id;
  notify(`${name} released from ${booking.id}`);
}

function cancelBooking(id) {
  const booking = bookingById(id);
  if (!booking || booking.status === "completed" || booking.status === "cancelled") return;
  if (state.role === "rider" && booking.guestId !== MEMBER.id) return;
  if (state.role === "rider" && !["requested", "confirmed", "assigned"].includes(booking.status)) {
    notify("This trip can no longer be cancelled");
    return;
  }
  applyStatus(booking, "cancelled", `${booking.id} · reservation cancelled`);
  state.pendingCancel = "";
  state.flashId = booking.id;
  notify(`${booking.id} cancelled`);
}

function resetDemo() {
  confirmTimers.forEach((timer) => window.clearTimeout(timer));
  confirmTimers.clear();
  state.data = seed();
  state.flashId = "";
  state.pendingCancel = "";
  state.formError = "";
  notify("Sample day restored");
}

function onClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action } = button.dataset;
  if (action === "role") setRole(button.dataset.role);
  else if (action === "nav") go(button.dataset.view);
  else if (action === "logout") logout();
  else if (action === "vehicle") selectVehicle(button.dataset.vehicle);
  else if (action === "guests") setGuests(state.guests + Number(button.dataset.dir || 0));
  else if (action === "day") {
    state.dayOffset = Number(button.dataset.offset || 0);
    render();
  }
  else if (action === "filter") {
    state.boardFilter = button.dataset.filter || "all";
    render();
  }
  else if (action === "assign") assign(button.dataset.id, button.dataset.driver);
  else if (action === "advance") advance(button.dataset.id);
  else if (action === "release") release(button.dataset.id);
  else if (action === "ask-cancel") {
    state.pendingCancel = button.dataset.id;
    render();
  }
  else if (action === "keep") {
    state.pendingCancel = "";
    render();
  }
  else if (action === "confirm-cancel") cancelBooking(button.dataset.id);
  else if (action === "reset") resetDemo();
}

function onSubmit(event) {
  if (event.target.id === "login-form") {
    event.preventDefault();
    enter();
  } else if (event.target.id === "book-form") {
    event.preventDefault();
    createBooking();
  }
}

function onInput(event) {
  if (!event.target.closest("#book-form")) return;
  state.formError = "";
  captureDraft();
  paintSummary();
  const error = document.querySelector(".form-error");
  if (error) error.remove();
}

function tickLive() {
  let changed = false;
  state.data.bookings.forEach((booking) => {
    if (booking.status !== "enroute") return;
    changed = true;
    if ((booking.eta || 0) > 1) booking.eta -= 1;
    if ((booking.eta || 0) <= 2) booking.note = "At the curb";
    else {
      booking.noteIndex = ((booking.noteIndex || 0) + 1) % NOTES.length;
      booking.note = NOTES[booking.noteIndex];
    }
    document.querySelectorAll(`[data-eta="${booking.id}"]`).forEach((node) => {
      node.textContent = etaLabel(booking.eta);
      node.classList.remove("tick");
      void node.offsetWidth;
      node.classList.add("tick");
    });
    const text = liveNote(booking);
    document.querySelectorAll(`[data-note="${booking.id}"]`).forEach((node) => {
      node.textContent = text;
    });
  });
  if (changed) save();
}

function bind() {
  document.addEventListener("click", onClick);
  document.addEventListener("submit", onSubmit);
  document.addEventListener("input", onInput);
  document.addEventListener("change", onInput);
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY || !event.newValue) return;
    state.data = load();
    if (state.user) render();
  });
}

function startLive() {
  if (liveTimer) return;
  liveTimer = window.setInterval(tickLive, 4000);
}

function init() {
  bind();
  startLive();
  render();
}

init();
