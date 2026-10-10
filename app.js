'use strict';

const validCode = code => /^[0-9]{10}$/.test(code);
const stageNames = { queued: 'Order received', printing: 'Printing', finishing: 'Finishing & checking', ready: 'Ready', completed: 'Completed', on_hold: 'On hold', cancelled: 'Cancelled' };

async function getOrders() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('orders.json', { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error('Order data unavailable');
    const orders = await response.json();
    if (!orders || typeof orders !== 'object' || Array.isArray(orders)) throw new Error('Invalid order data');
    return orders;
  } finally { clearTimeout(timeout); }
}

function findOrder(orders, code) {
  if (!validCode(code) || !Object.prototype.hasOwnProperty.call(orders, code)) return null;
  const order = orders[code];
  if (!order || typeof order !== 'object' || Array.isArray(order)) throw new Error('Invalid order');
  if (!Object.prototype.hasOwnProperty.call(stageNames, order.stage) || !['pickup', 'delivery'].includes(order.fulfillment)) throw new Error('Invalid order settings');
  return order;
}

function setText(id, value, fallback = '') {
  document.getElementById(id).textContent = typeof value === 'string' && value.trim() ? value : fallback;
}

if (document.body.dataset.page === 'lookup') {
  const form = document.getElementById('lookup-form');
  const input = document.getElementById('confirmation');
  const error = document.getElementById('lookup-error');
  const button = document.getElementById('lookup-button');
  function showError(message) {
    error.textContent = message;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
  }
  input.addEventListener('input', () => { error.hidden = true; input.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;
    const code = input.value.trim();
    if (!validCode(code)) { showError('Please enter exactly 10 digits (0–9).'); return; }
    error.hidden = true;
    input.removeAttribute('aria-invalid');
    button.disabled = true;
    button.firstElementChild.textContent = 'Checking your number…';
    form.setAttribute('aria-busy', 'true');
    try {
      const order = findOrder(await getOrders(), code);
      if (!order) { showError('We couldn’t find that number. Check the 10 digits and try again.'); return; }
      window.location.assign('status.html#' + code);
    } catch {
      error.textContent = 'We couldn’t load the order information. Please try again in a moment.';
      error.hidden = false;
    } finally {
      button.disabled = false;
      button.firstElementChild.textContent = 'View print status';
      form.removeAttribute('aria-busy');
    }
  });
}

function renderOrder(code, order) {
  const isDelivery = order.fulfillment === 'delivery';
  const readyLabel = isDelivery ? 'Ready for delivery' : 'Ready for pickup';
  const label = order.stage === 'ready' ? readyLabel : stageNames[order.stage];
  setText('order-code', code);
  setText('status-badge', label);
  document.getElementById('status-badge').dataset.stage = order.stage;
  setText('print-name', order.printName, 'Your 3D print');
  setText('status-detail', order.statusDetail, 'Robinson will post the next update here.');
  setText('fulfillment-label', isDelivery ? 'DELIVERY TIMING' : 'PICKUP TIMING');
  const inactive = order.stage === 'on_hold' || order.stage === 'cancelled';
  setText('ready-time', inactive ? (order.stage === 'cancelled' ? 'Order cancelled' : 'Timing on hold') : order.readyAt, 'To be confirmed');
  setText('fulfillment-note', order.fulfillmentNote, 'Timing will be confirmed here when available.');
  setText('order-note', order.note, 'Thanks for choosing Robinson’s 3D Printing Service!');
  setText('updated-at', order.updatedAt ? 'Last updated by Robinson: ' + order.updatedAt : 'An update time has not been added yet.');
  const timeline = document.getElementById('timeline');
  timeline.replaceChildren();
  timeline.hidden = inactive;
  const stages = ['queued', 'printing', 'finishing', 'ready', 'completed'];
  const current = stages.indexOf(order.stage);
  stages.forEach((stage, index) => {
    const item = document.createElement('li');
    item.className = index < current ? 'done' : index === current ? 'current' : '';
    if (index === current) item.setAttribute('aria-current', 'step');
    const mark = document.createElement('span');
    mark.className = 'step-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = index < current ? '✓' : String(index + 1).padStart(2, '0');
    const text = document.createElement('span');
    text.textContent = stage === 'ready' ? readyLabel : stageNames[stage];
    item.append(mark, text);
    timeline.append(item);
  });
}

if (document.body.dataset.page === 'status') {
  const panel = document.getElementById('order');
  const message = document.getElementById('status-message');
  const refresh = document.getElementById('refresh-button');
  let requestVersion = 0;
  async function loadOrder() {
    const version = ++requestVersion;
    const code = window.location.hash.slice(1);
    panel.hidden = true;
    message.hidden = false;
    message.textContent = 'Looking up your print…';
    if (!validCode(code)) { message.textContent = 'Enter a valid 10-digit confirmation number on the lookup page.'; return; }
    refresh.disabled = true;
    try {
      const order = findOrder(await getOrders(), code);
      if (version !== requestVersion) return;
      if (!order) { message.textContent = 'We couldn’t find this order. Return to the lookup page and check your confirmation number.'; return; }
      renderOrder(code, order);
      panel.hidden = false;
      message.hidden = true;
      setText('refresh-message', 'Showing the latest published order information.');
    } catch {
      if (version !== requestVersion) return;
      message.textContent = 'Order information is temporarily unavailable. Reload this page to try again, or return to the lookup page.';
    } finally { if (version === requestVersion) refresh.disabled = false; }
  }
  refresh.addEventListener('click', loadOrder);
  window.addEventListener('hashchange', loadOrder);
  loadOrder();
}
