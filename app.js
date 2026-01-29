const days = ["月", "火", "水", "木", "金"];
const daysMap = { "月": 1, "火": 2, "水": 3, "木": 4, "金": 5 };

const periods = [
  { id: 1, name: "１限", time: "8:30〜10:00" },
  { id: 2, name: "２限", time: "10:20〜11:50" },
  { id: "lunch", name: "昼休憩", time: "11:50〜12:50" },
  { id: 3, name: "３限", time: "12:50〜14:20" },
  { id: 4, name: "４限", time: "14:40〜16:10" },
  { id: 5, name: "５限", time: "16:20〜17:50" }
];

const STATUS = ["未選択", "出席", "欠席", "休講", "オンデマンド", "ONLINE"];

const STATUS_EMOJI = {
  "出席": "✓",
  "欠席": "✕",
  "休講": "休",
  "オンデマンド": "📹",
  "ONLINE": "💻"
};

let data = JSON.parse(localStorage.getItem("timetablePro")) || {};
let term = JSON.parse(localStorage.getItem("term")) || {};

let currentKey = null;

/* ================= 日付フォーマット ================= */
function formatDate(str) {
  const d = new Date(str);
  const y = d.getFullYear();
  const m = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return `${y}/${m}/${day}`;
}

/* ================= 今週の日付を取得 ================= */
function getThisWeekDates() {
  const today = new Date();
  const currentDay = today.getDay(); // 0:日曜 1:月曜 ... 6:土曜
  
  // 月曜日を週の開始として計算
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  
  const weekDates = {};
  
  // 月曜日から金曜日までの日付を生成
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateKey = date.toISOString().slice(0, 10);
    weekDates[days[i]] = dateKey;
  }
  
  return weekDates;
}

/* ================= 保存 ================= */
function save() {
  localStorage.setItem("timetablePro", JSON.stringify(data));
  render();
}

/* ================= 期間 ================= */
function saveTermFunc() {
  term.start = startDate.value;
  term.end = endDate.value;
  localStorage.setItem("term", JSON.stringify(term));
  updateTitle();
  
  // フィードバック
  const btn = document.getElementById('saveTermBtn');
  const originalText = btn.textContent;
  btn.textContent = '✓ 保存完了';
  setTimeout(() => {
    btn.textContent = originalText;
  }, 1500);
}

function updateTitle() {
  if (term.start && term.end) {
    const s = formatDate(term.start);
    const e = formatDate(term.end);
    title.innerText = `${s} 〜 ${e}`;
  } else {
    title.innerText = "時間割";
  }
}

/* ================= 表描画 ================= */
function render() {
  const thisWeek = getThisWeekDates();
  
  let html = "<table>";

  // ヘッダー行
  html += "<tr><th>時限</th>";
  days.forEach(d => html += `<th>${d}</th>`);
  html += "</tr>";

  // 各時限の行
  periods.forEach(p => {
    html += `<tr><th class="period"><div>${p.name}</div><div class="time">${p.time}</div></th>`;

    days.forEach(d => {
      const key = d + "_" + p.id;
      const item = data[key] || {};
      
      // 今週の出席状況を取得
      let statusDisplay = "";
      if (item.attend && thisWeek[d]) {
        const todayStatus = item.attend[thisWeek[d]];
        if (todayStatus && todayStatus !== "未選択") {
          let badgeClass = "status-badge";
          let statusText = "";
          
          switch(todayStatus) {
            case "出席":
              badgeClass += " status-attend";
              statusText = "✓ 出席";
              break;
            case "欠席":
              badgeClass += " status-absent";
              statusText = "✕ 欠席";
              break;
            case "休講":
              badgeClass += " status-cancelled";
              statusText = "休講";
              break;
            case "オンデマンド":
              badgeClass += " status-ondemand";
              statusText = "📹 配信";
              break;
            case "オンライン":
              badgeClass += " status-online";
              statusText = "💻 Online";
              break;
          }
          
          statusDisplay = `<div class="${badgeClass}">${statusText}</div>`;
        }
      }

      html += `
      <td data-key="${key}" style="background:${item.color || "#fff"}">
        ${statusDisplay}
        <div class="name">${item.name || ""}</div>
        <div class="room">${item.room || ""}</div>
      </td>
      `;
    });

    html += "</tr>";
  });

  html += "</table>";

  app.innerHTML = html;

  // クリックイベント登録
  document.querySelectorAll("td[data-key]").forEach(td => {
    td.onclick = () => openModal(td.dataset.key);
  });
}

/* ================= モーダル ================= */
function openModal(key) {
  currentKey = key;

  if (!data[key]) {
    data[key] = { attend: {} };
  }

  const item = data[key];

  className.value = item.name || "";
  room.value = item.room || "";
  teacher.value = item.teacher || "";
  note.value = item.note || "";
  color.value = item.color || "#90caf9";

  // 授業情報タブに切り替え
  showInfoTab();
  
  buildAttend();

  modal.classList.remove("hidden");
  
  // iOSのスクロール制御
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = '';
}

/* ================= 出席管理 ================= */
function buildAttend() {
  attendArea.innerHTML = "";

  if (!term.start || !term.end) {
    attendArea.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">※期間を設定してください</div>';
    return;
  }

  // 現在の授業の曜日を取得
  const [dayOfWeek, periodId] = currentKey.split("_");
  const targetDayIndex = daysMap[dayOfWeek];
  
  if (!targetDayIndex) {
    attendArea.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">※昼休憩には出席管理がありません</div>';
    return;
  }

  let d = new Date(term.start);
  const end = new Date(term.end);

  const attend = data[currentKey].attend || {};
  const dateList = [];

  // 指定された曜日の日付のみを収集
  while (d <= end) {
    if (d.getDay() === targetDayIndex) {
      const key = d.toISOString().slice(0, 10);
      dateList.push(key);
    }
    d.setDate(d.getDate() + 1);
  }

  if (dateList.length === 0) {
    attendArea.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:20px;">※該当する曜日がありません</div>';
    return;
  }

  // 曜日のヘッダーを追加
  const header = document.createElement("div");
  header.className = "attend-header";
  header.innerHTML = `<strong>${dayOfWeek}曜日の出席管理</strong> (全${dateList.length}回)`;
  attendArea.appendChild(header);

  // 各日付の出席管理行を作成
  dateList.forEach(key => {
    const row = document.createElement("div");
    row.className = "att-row";

    const date = document.createElement("span");
    date.innerText = formatDate(key);
    
    // 今週の日付かどうかをチェック
    const thisWeek = getThisWeekDates();
    const isThisWeek = Object.values(thisWeek).includes(key);
    if (isThisWeek) {
      date.classList.add("this-week");
    }

    const select = document.createElement("select");

    STATUS.forEach(s => {
      const op = document.createElement("option");
      op.value = s;
      op.innerText = s;

      if (attend[key] === s) {
        op.selected = true;
      }

      select.appendChild(op);
    });

    select.onchange = () => {
      attend[key] = select.value;
      data[currentKey].attend = attend;
      save();
    };

    row.appendChild(date);
    row.appendChild(select);

    attendArea.appendChild(row);
  });
}

/* ================= タブ切り替え ================= */
function showInfoTab() {
  tabInfo.classList.add("active");
  tabAttend.classList.remove("active");
  infoArea.classList.remove("hidden");
  attendArea.classList.add("hidden");
}

function showAttendTab() {
  tabAttend.classList.add("active");
  tabInfo.classList.remove("active");
  infoArea.classList.add("hidden");
  attendArea.classList.remove("hidden");
}

tabInfo.addEventListener("click", showInfoTab);
tabAttend.addEventListener("click", showAttendTab);

/* ================= 保存ボタン ================= */
saveBtn.addEventListener("click", () => {
  data[currentKey] = {
    name: className.value,
    room: room.value,
    teacher: teacher.value,
    note: note.value,
    color: color.value,
    attend: data[currentKey].attend || {}
  };

  save();
  closeModal();
});

/* ================= 閉じるボタン ================= */
closeBtn.addEventListener("click", closeModal);

// モーダルのオーバーレイクリックで閉じる
modal.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    closeModal();
  }
});

/* ================= 期間保存ボタン ================= */
saveTermBtn.addEventListener("click", saveTermFunc);

/* ================= 初期化 ================= */
if (term.start) startDate.value = term.start;
if (term.end) endDate.value = term.end;

updateTitle();
render();

