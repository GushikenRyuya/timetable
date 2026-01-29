const days = ["月","火","水","木","金"];

// 時限（修正版：昼休憩を明確化）
const periods = [
  { id: 1, name: "１限", time: "8:30〜10:00" },
  { id: 2, name: "２限", time: "10:20〜11:50" },
  { id: "lunch", name: "昼休憩", time: "11:50〜12:50" },
  { id: 3, name: "３限", time: "12:50〜14:20" },
  { id: 4, name: "４限", time: "14:40〜16:10" },
  { id: 5, name: "５限", time: "16:20〜17:50" }
];

let data = JSON.parse(localStorage.getItem("timetablePro")) || {};
let term = JSON.parse(localStorage.getItem("term")) || {};

let currentKey = null;


// 保存
function save(){
  localStorage.setItem("timetablePro", JSON.stringify(data));
  render();
}


// 期間保存
function saveTerm(){

  term.start = document.getElementById("startDate").value;
  term.end = document.getElementById("endDate").value;

  localStorage.setItem("term", JSON.stringify(term));

  updateTitle();
}


// タイトル更新
function updateTitle(){

  if(term.start && term.end){

    document.getElementById("title").innerText =
      `${term.start} ～ ${term.end} の時間割`;

  }else{

    document.getElementById("title").innerText = "時間割";
  }
}


// 表描画（修正版）
function render(){

  let html = "<table>";

  // ヘッダー
  html += "<tr><th>時限</th>";
  days.forEach(d => html += `<th>${d}</th>`);
  html += "</tr>";


  // 本体
  periods.forEach(p => {

    html += `
      <tr>
        <th class="period">
          <div class="p-name">${p.name}</div>
          <div class="p-time">${p.time}</div>
        </th>
    `;

    days.forEach(d => {

      const key = d + "_" + p.id;
      const item = data[key] || {};

      html += `
        <td
          style="background:${item.color || "#fff"}"
          onclick="openModal('${key}')"
        >
          <div class="name">${item.name || ""}</div>
          <div class="room">${item.room || ""}</div>
        </td>
      `;
    });

    html += "</tr>";
  });

  html += "</table>";

  document.getElementById("app").innerHTML = html;
}


// モーダル
function openModal(key){

  currentKey = key;

  const item = data[key] || {};

  document.getElementById("className").value = item.name || "";
  document.getElementById("room").value = item.room || "";
  document.getElementById("teacher").value = item.teacher || "";
  document.getElementById("note").value = item.note || "";
  document.getElementById("color").value = item.color || "#90caf9";

  document.getElementById("modal").classList.remove("hidden");
}


function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}


// 保存
document.getElementById("saveBtn").onclick = () => {

  data[currentKey] = {

    name: document.getElementById("className").value,
    room: document.getElementById("room").value,
    teacher: document.getElementById("teacher").value,
    note: document.getElementById("note").value,
    color: document.getElementById("color").value

  };

  save();
  closeModal();
};


document.getElementById("saveTerm").onclick = saveTerm;
document.getElementById("closeBtn").onclick = closeModal;


// 初期化
if(term.start){
  document.getElementById("startDate").value = term.start;
}
if(term.end){
  document.getElementById("endDate").value = term.end;
}

updateTitle();
render();
