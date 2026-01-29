// 曜日・時限設定
const days = ["月","火","水","木","金"];
const periods = [1,2,3,4,5];

// データ読み込み
let data = JSON.parse(localStorage.getItem("timetableApp")) || {};

// 編集中セル
let currentKey = null;


// 保存
function save(){
  localStorage.setItem("timetableApp", JSON.stringify(data));
  render();
}


// 表示
function render(){

  let html = "<table>";

  // ヘッダー
  html += "<tr><th></th>";
  days.forEach(d => html += `<th>${d}</th>`);
  html += "</tr>";

  // 本体
  periods.forEach(p => {

    html += `<tr><th>${p}</th>`;

    days.forEach(d => {

      const key = d + p;
      const item = data[key] || {};

      html += `
        <td
          style="background:${item.color || '#fff'}"
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


// モーダル表示
function openModal(key){

  currentKey = key;

  const item = data[key] || {};

  document.getElementById("className").value = item.name || "";
  document.getElementById("room").value = item.room || "";
  document.getElementById("note").value = item.note || "";
  document.getElementById("color").value = item.color || "#90caf9";

  document.getElementById("modal").classList.remove("hidden");
}


// モーダル閉じる
function closeModal(){
  document.getElementById("modal").classList.add("hidden");
}


// 保存ボタン
document.getElementById("saveBtn").onclick = () => {

  data[currentKey] = {
    name: document.getElementById("className").value,
    room: document.getElementById("room").value,
    note: document.getElementById("note").value,
    color: document.getElementById("color").value
  };

  save();
  closeModal();
};


// 閉じるボタン
document.getElementById("closeBtn").onclick = closeModal;


// 初期表示
render();
