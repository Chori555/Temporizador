const storageKey = 'temporizador.fecha';
const input = document.querySelector('#target');
const status = document.querySelector('#status');
const saveMessage = document.querySelector('#save-message');
const fields = ['days', 'hours', 'minutes', 'seconds'].map(id => document.getElementById(id));
const formatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' });
let target = null;

try {
  const stored = localStorage.getItem(storageKey);
  if (stored !== null && Number.isFinite(new Date(Number(stored)).getTime())) {
    target = Number(stored);
    const local = new Date(target - new Date(target).getTimezoneOffset() * 60_000);
    input.value = local.toISOString().slice(0, 16);
  }
} catch {
  // The form remains available when the browser blocks storage.
}

function refresh() {
  if (target === null) return;

  const remaining = target - Date.now();
  const seconds = Math.max(0, Math.ceil(remaining / 1000));
  const values = [
    Math.floor(seconds / 86_400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];

  fields.forEach((field, index) => {
    field.textContent = String(values[index]).padStart(index === 0 ? 1 : 2, '0');
  });
  status.textContent = remaining <= 0
    ? 'La fecha objetivo ya ha llegado.'
    : `Hasta el ${formatter.format(target)}`;
}

input.addEventListener('input', () => input.setCustomValidity(''));
document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  const date = new Date(input.value);
  const selected = date.getTime();
  if (!Number.isFinite(selected)) {
    input.setCustomValidity('Elige una fecha y hora válidas.');
    input.reportValidity();
    return;
  }

  target = selected;
  try {
    localStorage.setItem(storageKey, String(target));
    saveMessage.textContent = 'Fecha guardada en este dispositivo.';
  } catch {
    saveMessage.textContent = 'El navegador ha bloqueado el guardado. La fecha estará disponible mientras esta pantalla siga abierta.';
  }
  saveMessage.hidden = false;
  refresh();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refresh();
});
window.addEventListener('pageshow', refresh);
refresh();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(console.error);
}
