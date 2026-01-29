const days = ["月","火","水","木","金"];

const periods = [
  { id: 1, name: "１限", time: "8:30〜10:00" },
  { id: 2, name: "２限", time: "10:20〜11:50" },
  { id: "lunch", name: "昼休憩", time: "11:50〜12:50" },
  { id: 3, name: "３限", time: "12:50〜14:20" },
  { id: 4, name: "４限", time: "14:40〜16:10" },
  { id: 5, name: "５限", time: "16:20〜17:50" }
];

const STATUS = ["出席","欠席","休講","オンデマンド","ONLINE"];

let data = JSON.parse(localStorage.getItem("timetablePro")) || {};
let term = JSON.parse(localStorage.getItem("term")) || {};

let currentKey = null;


/* ================= 日付フォーマット ================= */

function formatDate(str){

  const d = new Date(str);

  const y = d.getFullYear();
  const m = ("0"+(d.getMonth()+1)).slice(-2);
  const day = ("0"+d.getDate()).slice(-2);

  return `${y}/${m}/${day}`;
}


/* ================= 保存 ================= */

function save(){
  localStorage.setItem("timetablePro", JSON.stringify(data));
  render();
}


/* ================= 期間 ================= */

function saveTerm(){

  term.start = startDate.value;
  term.end = endDate.value;

  localStorage.setItem("term", JSON.stringify(term));

  updateTitle();
}


function updateTitle(){

  if(term.start && term.end){

    const s = formatDate(term.start);
    const e = formatDate(term.end);

    title.innerText = `${s} ～ ${e} の時間割`;

  }else{

    title.innerText = "時間割";
  }
}


/* ================= 表描画 ================= */

function render(){

  let html = "<table>";

  html += "<tr><th>時限</th>";
  days.forEach(d => html += `<th>${d}</th>`);
  html += "</tr>";


  periods.forEach(p => {

    html += `
    <tr>
      <th class="period">
        <div>${p.name}</div>
        <div class="time">${p.time}</div>
      </th>
    `;

    days.forEach(d => {

      const key = d + "_" + p.id;
      const item = data[key] || {};

      html += `
      <td data-key="${key}"
          style="background:${item.color || "#fff"}">

        <div class="name">${item.name || ""}</div>
        <div class="room">${item.room || ""}</div>

      </td>
      `;

    });

    html += "</tr>";
  });

  html += "</table>";

  app.innerHTML = html;

  // クリック登録（iOS対策）
  document.querySelectorAll("td").forEach(td=>{

    td.onclick = ()=> openModal(td.dataset.key);

  });
}


/* ================= モーダル ================= */

function openModal(key){

  currentKey = key;

  if(!data[key]){
    data[key] = { attend:{} };
  }

  const item = data[key];

  className.value = item.name || "";
  room.value = item.room || "";
  teacher.value = item.teacher || "";
  note.value = item.note || "";
  color.value = item.color || "#90caf9";

  buildAttend();

  modal.classList.remove("hidden");
}


function closeModal(){
  modal.classList.add("hidden");
}


/* ================= 出席管理 ================= */

function buildAttend(){

  attendArea.innerHTML = "";

  if(!term.start || !term.end){
    attendArea.innerHTML = "※期間を設定してください";
    return;
  }

  let d = new Date(term.start);
  const end = new Date(term.end);

  const attend = data[currentKey].attend || {};

  while(d <= end){

    const key = d.toISOString().slice(0,10);

    if(d.getDay() !== 0 && d.getDay() !== 6){

      const row = document.createElement("div");
      row.className = "att-row";

      const date = document.createElement("span");
      date.innerText = formatDate(key);

      const select = document.createElement("select");

      STATUS.forEach(s => {

        const op = document.createElement("option");
        op.value = s;
        op.innerText = s;

        if(attend[key] === s) op.selected = true;

        select.appendChild(op);

      });

      select.onchange = ()=>{

        attend[key] = select.value;
        data[currentKey].attend = attend;
        save();
      };

      row.appendChild(date);
      row.appendChild(select);

      attendArea.appendChild(row);
    }

    d.setDate(d.getDate()+1);
  }
}


/* ================= タブ ================= */

tabInfo.addEventListener("click",()=>{

  tabInfo.classList.add("active");
  tabAttend.classList.remove("active");

  infoArea.classList.remove("hidden");
  attendArea.classList.add("hidden");
});


tabAttend.addEventListener("click",()=>{

  tabAttend.classList.add("active");
  tabInfo.classList.remove("active");

  infoArea.classList.add("hidden");
  attendArea.classList.remove("hidden");
});


/* ================= 保存 ================= */

saveBtn.addEventListener("click",()=>{

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


closeBtn.addEventListener("click", closeModal);

saveTerm.addEventListener("click", saveTerm);


/* ================= 初期化 ================= */

if(term.start) startDate.value = term.start;
if(term.end) endDate.value = term.end;

updateTitle();
render();
