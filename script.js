// ELEMENTOS DOM
const calendarGrid = document.getElementById("calendar-grid");
const selectedDateDisplay = document.getElementById("selected-date-display");
const eventsList = document.getElementById("events-list");
const newEventBtn = document.getElementById("new-event-btn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const cancelEventBtn = document.getElementById("cancel-event-btn");
const saveEventBtn = document.getElementById("save-event-btn");
const eventTitleInput = document.getElementById("event-title");
const eventDateInput = document.getElementById("event-date");
const eventTimeInput = document.getElementById("event-time");
const eventNotifyInput = document.getElementById("event-notify");
const alertEl = document.getElementById("alert");

// BOTÕES DE MUDAR DE MÊS
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
const currentMonthLabel = document.getElementById("current-month");

// VARIÁVEIS
let today = new Date();
let selectedDate = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);
let currentViewDate = new Date(selectedDate); // ✅ Novo: controla o mês exibido
let events = JSON.parse(localStorage.getItem("events")) || [];

// FUNÇÕES AUXILIARES
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function isToday(date) {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// NOVA FUNÇÃO PARA EXIBIR CABEÇALHO DE MÊS
function updateMonthHeader() {
  currentMonthLabel.textContent = currentViewDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

// RENDER CALENDÁRIO
function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  updateMonthHeader();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day", "empty");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayDate = new Date(year, month, day);
    const dayCell = document.createElement("div");
    dayCell.classList.add("day");

    if (isToday(dayDate)) dayCell.classList.add("today");

    if (
      dayDate.getDate() === selectedDate.getDate() &&
      dayDate.getMonth() === selectedDate.getMonth() &&
      dayDate.getFullYear() === selectedDate.getFullYear()
    ) {
      dayCell.classList.add("selected");
    }

    dayCell.textContent = day;

    const dayStr = formatDate(dayDate);
    const dayEvents = events.filter((e) => e.date === dayStr);

    if (dayEvents.length > 0) {
      const badge = document.createElement("div");
      badge.classList.add("badge");
      badge.textContent = dayEvents.length;
      dayCell.appendChild(badge);
    }

    dayCell.addEventListener("click", () => {
      selectedDate = dayDate;
      renderCalendar();
      renderEventsList();
      
    });

    calendarGrid.appendChild(dayCell);
  }

  selectedDateDisplay.textContent = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// EVENTOS DA LISTA
function renderEventsList() {
  eventsList.innerHTML = "";

  const dayEvents = events.filter((e) => e.date === formatDate(selectedDate));

  if (dayEvents.length === 0) {
    const noEvents = document.createElement("li");
    noEvents.textContent = "Nenhum evento para este dia.";
    noEvents.classList.add("muted");
    eventsList.appendChild(noEvents);
    return;
  }

  dayEvents.forEach((event, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${event.time}</strong> - ${event.title}
        <div class="timer" id="timer-${index}">Carregando timer...</div>
      </div>
      <div>Notificar em: ${
        event.notify ? event.notify + " min" : "Não configurado"
      }</div>
      <button class="danger" data-index="${index}">Excluir</button>
    `;

    const deleteBtn = li.querySelector("button.danger");
    deleteBtn.addEventListener("click", () => {
      events = events.filter(
        (e, i) => !(i === index && e.date === formatDate(selectedDate))
      );
      localStorage.setItem("events", JSON.stringify(events));
      renderCalendar();
      renderEventsList();
    });

    eventsList.appendChild(li);

    if (event.notify) {
      setupTimer(event, index);
    } else {
      document.getElementById(`timer-${index}`).textContent = "";
    }
  });
}

function setupTimer(event, index) {
  const timerEl = document.getElementById(`timer-${index}`);

  function updateTimer() {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const notifyTime = new Date(eventDateTime.getTime() - event.notify * 60000);
    const now = new Date();

    const diff = notifyTime - now;

    if (diff <= 0) {
      timerEl.textContent = "⏰ Hora do evento!";
      showAlert(`Lembrete: "${event.title}" está para começar!`);
      clearInterval(intervalId);
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      timerEl.textContent = `⏳ ${minutes}m ${seconds}s para notificação`;
    }
  }

  updateTimer();
  const intervalId = setInterval(updateTimer, 1000);
}

function showAlert(message) {
  const alertBox = document.getElementById("alert");
  const audio = document.getElementById("alert-sound");

  alertBox.textContent = message;
  alertBox.classList.remove("hidden");

  //Tocar som
  audio.currentTime = 0;
  audio.play().catch(() => {
    console.log("Reprodução automática bloqueada até interação do usuário.");
  });

  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 5000);
}

// NAVEGAÇÃO ENTRE MESES
prevBtn.addEventListener("click", () => {
  currentViewDate.setMonth(currentViewDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentViewDate.setMonth(currentViewDate.getMonth() + 1);
  renderCalendar();
});

// Eventos do modal
newEventBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");

  eventDateInput.value = formatDate(selectedDate);
  eventTitleInput.value = "";
  eventTimeInput.value = "";
  eventNotifyInput.value = "";
});

closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));
cancelEventBtn.addEventListener("click", () => modal.classList.add("hidden"));

saveEventBtn.addEventListener("click", () => {
  const title = eventTitleInput.value.trim();
  const date = eventDateInput.value;
  const time = eventTimeInput.value;
  const notify = Number(eventNotifyInput.value);

  if (!title || !date || !time) {
    alert("Por favor, preencha título, data e hora do evento.");
    return;
  }

  events.push({ title, date, time, notify: isNaN(notify) ? 0 : notify });
  localStorage.setItem("events", JSON.stringify(events));
  modal.classList.add("hidden");

  renderCalendar();
  renderEventsList();
});

// Inicializa
renderCalendar();
renderEventsList();

document.addEventListener(
  "click",
  () => {
    const audio = document.getElementById("alert-sound");
    audio.play().catch(() => {});
  },
  { once: true }
);

// ==============================
// RECONHECIMENTO DE VOZ INTELIGENTE
// ==============================
const voiceEventBtn = document.getElementById("voice-event-btn");

// Verifica compatibilidade
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
  voiceEventBtn.disabled = true;
  voiceEventBtn.textContent = "🎤 Voz não suportada";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceEventBtn.addEventListener("click", () => {
    recognition.start();
    voiceEventBtn.textContent = "🎙️ Ouvindo...";
  });

  recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("🗣️ Texto reconhecido:", transcript);
    voiceEventBtn.textContent = "🎤 Criar evento por voz";

    // === Título ===
    const titleMatch = transcript.match(/(reunião|aula|aniversário|tarefa|evento|compromisso|lembrete|prova|apresentação|curso|entrega)(.*)/);
    let title = titleMatch ? titleMatch[0].trim() : transcript;

    // === Data base ===
    let date = new Date(selectedDate);
    const hoje = new Date();

    // === Palavras-chave de tempo ===
    if (transcript.includes("amanhã")) date.setDate(hoje.getDate() + 1);
    else if (transcript.includes("depois de amanhã")) date.setDate(hoje.getDate() + 2);
    else if (transcript.includes("semana que vem")) date.setDate(hoje.getDate() + 7);
    else {
      // Dia da semana
      const diasSemana = ["domingo","segunda","terça","quarta","quinta","sexta","sábado"];
      diasSemana.forEach((dia, i) => {
        if (transcript.includes(dia)) {
          const diff = (i + 7 - hoje.getDay()) % 7 || 7;
          date.setDate(hoje.getDate() + diff);
        }
      });

      // Dia e mês (ex: "dia 20 de novembro")
      const dataMatch = transcript.match(/dia (\d{1,2})( de ([a-zç]+))?/);
      if (dataMatch) {
        const dia = parseInt(dataMatch[1]);
        const meses = {
          janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
          julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
        };
        let mesAtual = hoje.getMonth();
        if (dataMatch[3] && meses[dataMatch[3]]) mesAtual = meses[dataMatch[3]];
        date = new Date(hoje.getFullYear(), mesAtual, dia);
      }
    }

    // === Hora ===
    const horaMatch = transcript.match(/(\d{1,2})([:h ](\d{2}))? ?(horas|h)?/);
    let hours = 12, minutes = 0;
    if (horaMatch) {
      hours = parseInt(horaMatch[1]);
      minutes = horaMatch[3] ? parseInt(horaMatch[3]) : 0;
    }
    const time = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    // === Preenche o modal ===
    modal.classList.remove("hidden");
    eventTitleInput.value = title.charAt(0).toUpperCase() + title.slice(1);
    eventDateInput.value = formatDate(date);
    eventTimeInput.value = time;
    eventNotifyInput.value = "10";

    showAlert(`🎤 Evento detectado: "${eventTitleInput.value}" para ${date.toLocaleDateString("pt-BR")} às ${time}`);
  });

  recognition.addEventListener("error", (e) => {
    console.error("Erro no reconhecimento:", e.error);
    voiceEventBtn.textContent = "🎤 Criar evento por voz";
    showAlert("❌ Erro ao usar o microfone. Tente novamente.");
  });
}

