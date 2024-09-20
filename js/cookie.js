import { CihuyGetCookie } from "https://c-craftjs.github.io/cookies/cookies.js";
import { CihuyGetHeaders } from "https://c-craftjs.github.io/api/api.js";
import { qrController, setCookieWithExpireHour } from "https://cdn.jsdelivr.net/gh/whatsauth/js@0.3.3/whatsauth.js";
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

      // Panggil qrController untuk memulai QR code
      qrController(wauthparam);
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
    "https://mrt.ulbi.ac.id/notif/ux/getdatauser",
    "login",
    getCookie("login"),
    getUserFunction
  );
  show("saveForm");
}

