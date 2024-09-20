import { CihuyGetCookie } from "https://c-craftjs.github.io/cookies/cookies.js";
import { CihuyGetHeaders } from "https://c-craftjs.github.io/api/api.js";
import { qrController } from "https://cdn.jsdelivr.net/gh/whatsauth/js@0.3.3/whatsauth.js";
import { wauthparam } from "https://cdn.jsdelivr.net/gh/whatsauth/js@0.3.3/config.js";

// Fungsi utama yang menggabungkan kedua alur
document.addEventListener("DOMContentLoaded", async () => {
  let token = CihuyGetCookie("login");

  // Jika cookie login ada, periksa validitas login
  if (token) {
    const postApiUrlMenu = "https://simbe-dev.ulbi.ac.id/api/v1/menu/";

    try {
      // Lakukan permintaan POST
      const postResult = await CihuyGetHeaders(postApiUrlMenu, token);
      const responseData = JSON.parse(postResult);

      // Proses validasi dan pengalihan halaman
      processResponseData(responseData);
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    // Jika tidak ada cookie, munculkan SweetAlert untuk login QR code
    openSweetAlertLogin();
  }
});

// Fungsi untuk memproses respons dari API
function processResponseData(responseData) {
  let dataUrl = responseData.data;
  let targetPage = "";

  if (
    responseData.code === 400 &&
    responseData.success === false &&
    responseData.status === "Data user level tidak ditemukan" &&
    responseData.data === null
  ) {
    window.location.href = "https://euis.ulbi.ac.id/simpelbi/404.html";
  } else if (dataUrl === "/admins") {
    targetPage = "dashboard-admins.html";
  } else if (dataUrl === "/prodi") {
    targetPage = "dashboard-prodi.html";
  } else if (dataUrl === "/fakultas") {
    targetPage = "dashboard-fakultas.html";
  } else if (dataUrl === "/auditors") {
    targetPage = "dashboard-auditor.html";
  } else if (
    responseData.code === 401 &&
    responseData.success === false &&
    responseData.status === "Unauthorize Token" &&
    responseData.data === null
  ) {
    targetPage = "404.html";
  } else {
    targetPage = "404.html";
    console.error("URL tidak sesuai");
    return;
  }

  const finalUrl = `https://euis.ulbi.ac.id/simpelbi${dataUrl}/${targetPage}`;
  window.location.href = finalUrl;
}

// Fungsi sweet alert untuk QR Code WhatsAuth login
function openSweetAlertLogin() {
  Swal.fire({
    icon: "info",
    title: "<strong>Login <u>Dulu</u> ya kaa</strong>",
    html: `
        <div class="flex justify-center mt-2 mb-4" id="whatsauthqr">
        <svg class="lds-microsoft" width="60px" height="60px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"></svg>
        </div>
        <p class="font-bold text-center mb-4" id="whatsauthcounter">Refresh your browser to get new QR</p>
        <p>Pastikan waktu hitung mundur cukup untuk melakukan scan dan kirim token</p>

        `,
    didRender: function () {
      // Definisikan wauthparam (URL WebSocket dan keyword)
      wauthparam.auth_ws =
        "d3NzOi8vZ3cudWxiaS5hYy5pZC93cy93aGF0c2F1dGgvcHVibGlj";
      wauthparam.keyword =
        "aHR0cHM6Ly93YS5tZS82MjgxMTIwMDAyNzk/dGV4dD13aDR0NWF1dGgw";
      wauthparam.redirect = "#" + crypto.randomUUID();

      qrController(wauthparam);
      let wsconn = new WebSocket(atob(wauthparam.auth_ws));

      wsconn.onopen = function () {
        console.log("WebSocket connected, waiting for QR scan...");
      };

      wsconn.onmessage = function (evt) {
        let result = evt.data;  // Data hasil pemindaian dari server
        catcher(result);  // Memproses hasil login setelah QR code berhasil dipindai
      };

      wsconn.onerror = function (error) {
        console.error("WebSocket error:", error);
      };

      // Menangani ketika koneksi WebSocket ditutup
      wsconn.onclose = function () {
        console.log("WebSocket connection closed.");
      };
    },
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
  });
}

// Fungsi untuk menangani aksi pengguna setelah pemindaian QR code
function closeSweetAlert() {
  Swal.close();
  // Setelah login berhasil, dapatkan data pengguna dengan token yang baru
  getWithHeader(
    "http://simpelbi.ulbi.ac.id/",
    "login",
    getCookie("login"),
    getUserFunction
  );
  show("saveForm");
}

function catcher(result) {
  if (result.length > 2) {
    const jsonres = JSON.parse(result); // Hasil login dari pemindaian QR code
    console.log("Login berhasil, memproses hasil login...");

    const tokenLifetime = 18;  // Misal 18 jam
    setCookieWithExpireHour("login", jsonres.login, tokenLifetime);
    setCookieWithExpireHour("ua", btoa(jsonres.user_id + "-" + jsonres.user_name), tokenLifetime);
    window.location.replace("http://simpelbi.ulbi.ac.id/");  // Redirect ke halaman login default
  }
}

function setCookieWithExpireHour(cname, cvalue, exhour) {
  const d = new Date();
  d.setTime(d.getTime() + (exhour * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}