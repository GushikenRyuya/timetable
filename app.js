// 曜日
const days = ["月","火","水","木","金"];

// 時限（指定仕様）
const periods = [
  { id: 1, name: "1限", time: "8:30-10:00" },
  { id: 2, name: "2限", time: "10:20-11:50" },
  { id: "lunch", name: "昼休憩", time: "11:50-12:50" },
  { id: 3, name: "3限", time: "12:50-14:20" },
  { id: 4, name: "4限", time: "14:40-16:10" },
  { id: 5, name: "5限", time: "16:20-17:50" }
];


// データ読み込み
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


// 表描画
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
          ${p.name}<br>
          <span>${p.time}</span>
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


// モーダル開く
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


// 閉じる
function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}


// 保存ボタン
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


// 期間保存ボタン
document.getElementById("saveTerm").onclick = saveTerm;

// 閉じるボタン
document.getElementById("closeBtn").onclick = closeModal;


// 初期表示
if(term.start){
  document.getElementById("startDate").value = term.start;
}
if(term.end){
  document.getElementById("endDate").value = term.end;
}

updateTitle();
render();
