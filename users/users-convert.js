import {
  CihuyDataAPI,
  CihuyPostApi,
  CihuyDeleteAPI,
  CihuyUpdateApi,
} from "https://c-craftjs.github.io/simpelbi/api.js";
import { token, UrlGetUsersrtm } from "../js/template/template.js";
// import { addFormrtm } from "./rtm/add.js";
import { populateUserProfile } from "https://c-craftjs.github.io/simpelbi/profile.js";
import { CihuyPaginations2 } from "https://c-craftjs.github.io/simpelbi/pagenations.js";

// Untuk GET Data Profile
populateUserProfile();

const itemsPerPage = 3;
let currentPage = 1;

// Function to display data for a specific page
function displayPageData(data, currentPage) {
  const tableBody = document.getElementById("content");
  tableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  let nomor = startIndex + 1;

  paginatedData.forEach((item) => {
    const barisBaru = document.createElement("tr");
    barisBaru.innerHTML = `
    <td>
       <div class="userDatatable-content">${nomor}</div>
    </td>
    <td>
       <div class="d-flex">
          <div class="userDatatable-inline-title">
             <a href="#" class="text-dark fw-500">
                <h6>${item.id_rtm}</h6>
             </a>
          </div>
       </div>
    </td>
    <td>
       <div class="userDatatable-content">
          ${item.user_level}
       </div>
    </td>
  
   
       <ul class="orderDatatable_actions mb-0 d-flex flex-wrap">

          <li>
             <a href="#" class="edit"  data-target="#new-member-update" data-rtm-id="${item.id_rtm}">
                <i class="uil uil-edit"></i>
             </a>
          </li>
          <li>
            <a href="#" class="remove" data-rtm-id="${item.id_rtm}">
               <i class="uil uil-trash-alt"></i>
            </a>
          </li>
       </ul>
    </td>
    `;

    const removeButton = barisBaru.querySelector(".remove");
    removeButton.addEventListener("click", () => {
      const id_rtm = removeButton.getAttribute("data-rtm-id");
      if (id_rtm) {
        deletertm(id_rtm);
      } else {
        console.error("ID rtm tidak ditemukan.");
      }
    });
    const editButton = barisBaru.querySelector(".edit");
    editButton.addEventListener("click", () => {
      const id_rtm = editButton.getAttribute("data-rtm-id");
      if (id_rtm) {
        editData(id_rtm);
      } else {
        console.error("ID rtm tidak ditemukan.");
      }
    });
    tableBody.appendChild(barisBaru);
    nomor++;
  });
}
function createPaginationControls(data) {
  const paginationContainer = document.querySelector(".dm-pagination");

  CihuyPaginations2(
    data,
    currentPage,
    itemsPerPage,
    paginationContainer,
    (newPage) => {
      currentPage = newPage;
      displayPageData(data, currentPage);
      createPaginationControls(data);
    }
  );
}
// Untuk Get Data dari API
CihuyDataAPI(UrlGetUsersrtm, token, (error, response) => {
  if (error) {
    console.error("Terjadi kesalahan:", error);
  } else {
    const data = response.data;
    console.log("Data yang diterima:", data);
    // ShowDataUsersAuditor(data);
    createPaginationControls(data);
    displayPageData(data, currentPage); // siklusdata(data);
  }
});

function fetchUsernameDataAndPopulateSuggestions() {
  const apiUrlConvert = "https://simbe-dev.ulbi.ac.id/api/v1/convert";
  let dataFromApi = [];
  const usernameInput = document.getElementById("username");

  // Panggil fungsi CihuyDataAPI untuk mengambil data saat halaman dimuat
  CihuyDataAPI(apiUrlConvert, token, (error, response) => {
    if (error) {
      console.error("Terjadi kesalahan:", error);
    } else {
      const data = response.data;
      dataFromApi = data;
    }
  });

  usernameInput.addEventListener("input", (e) => {
    const inputValue = e.target.value.toLowerCase();

    // Bersihkan daftar saran sebelumnya
    usernameSuggestions.innerHTML = "";

    // Filter opsi-opsi yang cocok dengan input pengguna
    const filteredOptions = dataFromApi.filter((item) =>
      item.id_rtm.toLowerCase().includes(inputValue)
    );

    // Tampilkan opsi-opsi dalam div saran
    filteredOptions.forEach((item) => {
      const suggestion = document.createElement("div");
      suggestion.textContent = item.id_rtm;
      suggestion.addEventListener("click", () => {
        // Setel nilai input saat opsi dipilih
        usernameInput.value = item.id_rtm;
        usernameSuggestions.innerHTML = ""; // Bersihkan daftar saran
      });
      usernameSuggestions.appendChild(suggestion);
    });
  });

  usernameInputUpdate.addEventListener("input", (e) => {
    const inputValue = e.target.value.toLowerCase();

    // Bersihkan daftar saran sebelumnya
    usernameSuggestionsUpdate.innerHTML = "";

    // Filter opsi-opsi yang cocok dengan input pengguna
    const filteredOptions = dataFromApi.filter((item) =>
      item.id_rtm.toLowerCase().includes(inputValue)
    );

    // Tampilkan opsi-opsi dalam div saran
    filteredOptions.forEach((item) => {
      const suggestion = document.createElement("div");
      suggestion.textContent = item.id_rtm;
      suggestion.addEventListener("click", () => {
        // Setel nilai input saat opsi dipilih
        usernameInputUpdate.value = item.id_rtm;
        usernameSuggestionsUpdate.innerHTML = "";
      });
      usernameSuggestionsUpdate.appendChild(suggestion);
    });
  });

  // Menutup daftar saran saat klik di luar input
  document.addEventListener("click", (e) => {
    if (e.target !== usernameInput && e.target !== usernameSuggestions) {
      usernameSuggestions.innerHTML = "";
    }
  });
}
fetchUsernameDataAndPopulateSuggestions();

// fungsi post data

function getBase64Image(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    const base64Image = reader.result.split(",")[1];
    callback(base64Image);
  };
  reader.onerror = function (error) {
    console.error("Terjadi kesalahan saat membaca file:", error);
    callback(null); // Call the callback with null if there's an error
  };
}

// Handle form submission when the "Tambah Data rtm" button is clicked
const tambahDatartmButton = document.getElementById("tambahDatartmButton");
tambahDatartmButton.addEventListener("click", function (e) {
  e.preventDefault();

  // Get data from form elements
  const rtm = document.getElementById("rtm").value;
  const dekan = document.getElementById("dekan").value;
  const nidn = document.getElementById("nidn").value;
  const niknip = document.getElementById("niknip").value;
  const telepon = document.getElementById("telp").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;

  const fotoInput = document.getElementById("fotoInput").files[0];

  // Convert the selected image to base64
  getBase64Image(fotoInput, function (base64Image) {
    if (base64Image === null) {
      console.error("Terjadi kesalahan saat mengonversi gambar.");
    } else {
      // Create an object with rtm data including the base64 image
      const data = {
        rtm: rtm,
        dekan: dekan,
        nidn: nidn,
        niknip: niknip,
        telp: telepon,
        email: email,
        user_name: username,

        foto: {
          // fileName: fotoInput.name,
          fileType: fotoInput.type,
          payload: base64Image,
        },
      };

      $("#new-member").modal("hide");

      // Show a confirmation SweetAlert
      Swal.fire({
        title: "Tambahkan Data rtm?",
        text: "Apakah Anda yakin ingin menambahkan data rtm ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Tambahkan",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          // Send the rtm data to the server using the sendrtmData function
          sendrtmData(data, UrlpostUsersrtm, token);
        }
      });
    }
  });
});
const UrlpostUsersrtm = "https://simbe-dev.ulbi.ac.id/api/v1/rtm/add";
// Fungsi untuk mengirim permintaan POST dengan data rtm
function sendrtmData(data, UrlpostUsersrtm, token) {
  CihuyPostApi(UrlpostUsersrtm, token, data)
    .then((responseText) => {
      console.log("Respon sukses:", responseText);
      // Menampilkan pesan sukses
      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Data rtm berhasil ditambahkan.",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        // Refresh halaman atau lakukan tindakan lain jika diperlukan
        window.location.reload();
      });
    })
    .catch((error) => {
      console.error("Terjadi kesalahan:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Terjadi kesalahan saat menambahkan data rtm.",
      });
    });
}

// fungsi edit

function getrtmDataById(id_rtm, callback) {
  const getrtmDataById = `https://simbe-dev.ulbi.ac.id/api/v1/rtm/get?idrtm=${id_rtm}`;

  CihuyDataAPI(getrtmDataById, token, (error, response) => {
    if (error) {
      console.error("Terjadi kesalahan saat mengambil rtm:", error);
      callback(error, null);
    } else {
      const rtmData = response.data;
      callback(null, rtmData);
    }
  });
}

// fungsi edit
// Fungsi untuk mengisi dropdown "rtm di form Update"

function editData(id_rtm) {
  getrtmDataById(id_rtm, (error, rtmData) => {
    if (error) {
      console.error("Gagal mengambil data rtm:", error);
      return;
    }

    // Mengisi formulir edit dengan data rtm yang diperoleh

    document.getElementById("dekan-update").value = rtmData.dekan;
    document.getElementById("niknip-update").value = rtmData.niknip;
    document.getElementById("telp-update").value = rtmData.telp;
    document.getElementById("email-update").value = rtmData.email;
    document.getElementById("nidn-update").value = rtmData.nidn;
    document.getElementById("username-update").value = rtmData.user_name;
    document.getElementById("rtm-update").value = rtmData.rtm;

    // Mengatur nilai input rtm dalam formulir
    // Menampilkan modal edit
    const modal = new bootstrap.Modal(
      document.getElementById("new-member-update")
    );
    modal.show();

    // Mengatur event listener untuk tombol "Simpan Perubahan"
    const simpanPerubahanButton = document.getElementById("updateDataButton");
    simpanPerubahanButton.addEventListener("click", function () {
      const rtmUpdate = document.getElementById("rtm-update").value;
      const niknipUpdate = document.getElementById("niknip-update").value;
      const telpUpdate = document.getElementById("telp-update").value;
      const emailUpdate = document.getElementById("email-update").value;
      const nidnUpdate = document.getElementById("nidn-update").value;
      const dekanUpdate = document.getElementById("dekan-update").value;
      const usernameUpdate = document.getElementById("username-update").value;

      // Mendapatkan file gambar yang akan diunggah
      const fotoInput = document.getElementById("fotoInput-update");
      const fotoFile = fotoInput.files[0];
      const datartmToUpdate = {
        rtm: rtmUpdate,
        niknip: niknipUpdate,
        telp: telpUpdate,
        email: emailUpdate,
        nidn: nidnUpdate,
        dekan: dekanUpdate,
        user_name: usernameUpdate,
        foto: {
          fileName: "", // Nama file gambar yang diunggah
          fileType: "image/jpeg", // Tipe file gambar
          payload: "", // Base64 gambar
        },
      };

      if (fotoFile) {
        // Jika ada perubahan pada gambar, maka proses gambar dan kirim dengan gambar
        const reader = new FileReader();
        reader.onload = function () {
          datartmToUpdate.foto.fileName = fotoFile.name;
          datartmToUpdate.foto.fileType = fotoFile.type;
          datartmToUpdate.foto.payload = reader.result.split(",")[1];

          // Hide modal ketika sudah selesai isi
          $("#new-member-update").modal("hide");

          // Tampilkan SweetAlert konfirmasi sebelum mengirim permintaan
          Swal.fire({
            title: "Update Data rtm?",
            text: "Apakah Anda yakin ingin mengupdate data rtm ini?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Update",
            cancelButtonText: "Batal",
          }).then((result) => {
            if (result.isConfirmed) {
              // Kirim permintaan PUT/UPDATE ke server dengan gambar
              sendUpdateRequestWithImage(id_rtm, datartmToUpdate, modal);
            }
          });
        };
        reader.readAsDataURL(fotoFile);
      } else {
        // Hide modal ketika sudah selesai isi
        $("#new-member-update").modal("hide");

        // Jika tidak ada perubahan pada gambar, kirim tanpa gambar
        // Tampilkan SweetAlert konfirmasi sebelum mengirim permintaan
        Swal.fire({
          title: "Update Data rtm?",
          text: "Apakah Anda yakin ingin mengupdate data rtm ini?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, Update",
          cancelButtonText: "Batal",
        }).then((result) => {
          if (result.isConfirmed) {
            // Kirim permintaan PUT/UPDATE ke server tanpa gambar
            sendUpdateRequestWithoutImage(id_rtm, datartmToUpdate, modal);
          }
        });
      }
    });

    // Fungsi untuk mengirim permintaan PUT/UPDATE dengan gambar
    function sendUpdateRequestWithImage(id_rtm, datartmToUpdate, modal) {
      const apiUrlrtmUpdate = `https://simbe-dev.ulbi.ac.id/api/v1/rtm/update?idrtm=${id_rtm}`;

      CihuyUpdateApi(
        apiUrlrtmUpdate,
        token,
        datartmToUpdate,
        (error, responseText) => {
          if (error) {
            console.error("Terjadi kesalahan saat mengupdate data rtm:", error);
            // Menampilkan pesan kesalahan
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Terjadi kesalahan saat mengupdate data rtm.",
            });
          } else {
            console.log("Respon sukses:", responseText);
            // Menutup modal edit
            modal.hide();
            // Menampilkan pesan sukses
            Swal.fire({
              icon: "success",
              title: "Sukses!",
              text: "Data rtm berhasil diperbarui.",
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              // Refresh halaman atau lakukan tindakan lain jika diperlukan
              window.location.reload();
            });
          }
        }
      );
    }

    // Fungsi untuk mengirim permintaan PUT/UPDATE tanpa gambar
    function sendUpdateRequestWithoutImage(id_rtm, datartmToUpdate, modal) {
      // Hapus properti foto dari datartmToUpdate
      delete datartmToUpdate.foto;

      const apiUrlrtmUpdate = `https://simbe-dev.ulbi.ac.id/api/v1/rtm/update?idrtm=${id_rtm}`;

      CihuyUpdateApi(
        apiUrlrtmUpdate,
        token,
        datartmToUpdate,
        (error, responseText) => {
          if (error) {
            console.error("Terjadi kesalahan saat mengupdate data rtm:", error);
            // Menampilkan pesan kesalahan
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Terjadi kesalahan saat mengupdate data rtm.",
            });
          } else {
            console.log("Respon sukses:", responseText);
            // Menutup modal edit
            modal.hide();
            // Menampilkan pesan sukses
            Swal.fire({
              icon: "success",
              title: "Sukses!",
              text: "Data rtm berhasil diperbarui.",
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              // Refresh halaman atau lakukan tindakan lain jika diperlukan
              window.location.reload();
            });
          }
        }
      );
    }
  });
}

// Untuk Get Data dari API
CihuyDataAPI(UrlGetUsersrtm, token, (error, response) => {
  if (error) {
    console.error("Terjadi kesalahan:", error);
  } else {
    const data = response.data;
    console.log("Data yang diterima:", data);
    // ShowDataUsersrtm(data);
    // CihuyPagination(data, itemsPerPage, "content", dataProsesAudit);
  }
});

function deletertm(id_rtm) {
  // Tampilkan dialog konfirmasi menggunakan SweetAlert2
  Swal.fire({
    title: "Apakah Anda yakin ingin menghapus rtm?",
    text: "Penghapusan rtm akan permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Tidak, Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      // Buat URL untuk mengambil rtm berdasarkan ID
      const apiUrlGetrtmById = `https://simbe-dev.ulbi.ac.id/api/v1/rtm/get?idrtm=${id_rtm}`;

      // Lakukan permintaan GET untuk mengambil rtm berdasarkan ID rtm
      CihuyDataAPI(apiUrlGetrtmById, token, (error, response) => {
        if (error) {
          console.error("Terjadi kesalahan saat mengambil rtm:", error);
        } else {
          const rtmData = response.data;
          if (rtmData) {
            // Dapatkan ID rtm dari data yang diterima
            const rtmId = rtmData.id_rtm;

            // Buat URL untuk menghapus rtm berdasarkan ID rtm yang telah ditemukan
            const apiUrlrtmDelete = `https://simbe-dev.ulbi.ac.id/api/v1/rtm/delete?idrtm=${rtmId}`;

            // Lakukan permintaan DELETE untuk menghapus rtm
            CihuyDeleteAPI(
              apiUrlrtmDelete,
              token,
              (deleteError, deleteData) => {
                if (deleteError) {
                  console.error(
                    "Terjadi kesalahan saat menghapus rtm:",
                    deleteError
                  );
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Terjadi kesalahan saat menghapus rtm!",
                  });
                } else {
                  console.log("rtm berhasil dihapus:", deleteData);
                  Swal.fire({
                    icon: "success",
                    title: "Sukses!",
                    text: "rtm berhasil dihapus.",
                  }).then(() => {
                    // Refresh halaman setelah menutup popup
                    window.location.reload();
                  });
                }
              }
            );
          } else {
            console.error("Data rtm tidak ditemukan.");
          }
        }
      });
    } else {
      // Tampilkan pesan bahwa penghapusan dibatalkan
      Swal.fire("Dibatalkan", "Penghapusan rtm dibatalkan.", "info");
    }
  });
}
