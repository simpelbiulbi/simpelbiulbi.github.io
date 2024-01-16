import {
  CihuyDataAPI,
  CihuyPostApi,
  //   CihuyDeleteAPI,
  CihuyUpdateApi,
} from "https://c-craftjs.github.io/simpelbi/api.js";
import {
  token,
  UrlGetKts,
  UrlGetStandar,
  //   UrlGetUsersFakultas,
  //   UrlGetJenjang,
  //   UrlGetSiklus,
} from "../js/template/template.js";
function setupFormVisibility() {
  var jawabanSelect = document.getElementById("jawabanindikator");
  jawabanSelect.addEventListener("change", function () {
    var selectedValue = jawabanSelect.value;
    var formElementsToHide = document.querySelectorAll(".form-group-to-hide");
    formElementsToHide.forEach(function (element) {
      if (selectedValue === "Tidak") {
        element.style.visibility = "hidden"; // Menyembunyikan elemen
      } else {
        element.style.visibility = "visible";
      }
    });
  });
}

import { populateUserProfile } from "https://c-craftjs.github.io/simpelbi/profile.js";

// Untuk Get Data Profile
populateUserProfile();

const urlParams = new URLSearchParams(window.location.search);
const idAmi = urlParams.get("id_ami");
const idProdiUnit = urlParams.get("id_prodi_unit");
// const apiUrl = `https://simbe-dev.ulbi.ac.id/api/v1/audit/getbyami?id_ami=${idAmi}`;
const apiUrlProdiUnit = `https://simbe-dev.ulbi.ac.id/api/v1/standar/getbyprodiunit?id_prodi_unit=${idProdiUnit}`;

const apiUpdateUrl = `https://simbe-dev.ulbi.ac.id/api/v1/audit/addbyami?id_ami=${idAmi}`;

const handleApiResponse = (error, data) => {
  if (error) {
    console.error("Error fetching data:", error);
  } else {
    console.log("Data received:", data);
  }
};

//postData
document.getElementById("buttoninsert").addEventListener("click", function () {
  // Retrieve form values
  const idStandar = document.getElementById("id_standar").value;
  const indikator = document.getElementById("indikator").value;
  const jawabanValue = document.getElementById("jawabanindikator").value;
  const idKts = document.getElementById("id_kts").value;
  const uraian = document.getElementById("uraian").value;
  const tindakPerbaikan = document.getElementById("tindakPerbaikan").value;
  const targetWaktuPerbaikan = document.getElementById("target").value;

  // Construct the data object
  let data = null;

  if (jawabanValue === "Tidak") {
    data = {
      id_standar: parseInt(idStandar),
      id_kts: parseInt(idKts),
      jawaban_indikator: jawabanValue,
      uraian: null, // Set other fields to null or remove them from the object
      tindak_perbaikan: null,
      target_waktu_perbaikan: null,
    };
  } else {
    // Send all fields when jawabanValue is not "Tidak"
    data = {
      id_standar: parseInt(idStandar),
      indikator: indikator,
      jawaban_indikator: jawabanValue,
      id_kts: parseInt(idKts),
      uraian: uraian,
      tindak_perbaikan: tindakPerbaikan,
      target_waktu_perbaikan: targetWaktuPerbaikan,
    };
  }

  const apiUrl = `https://simbe-dev.ulbi.ac.id/api/v1/audit/addbyami?id_ami=${idAmi}`;

  // Call the CihuyPostApi function
  CihuyPostApi(apiUrl, token, data)
    .then((response) => {
      // Handle the response as needed
      console.log(response);
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
    });
});

// Panggil fungsi CihuyDataAPI dengan parameter yang sesuai
CihuyDataAPI(apiUrlProdiUnit, token, handleApiResponse);

document.addEventListener("DOMContentLoaded", function () {
  setupFormVisibility();
});

function ktsdropdown(apiUrl, dropdownId) {
  const dropdown = document.getElementById(dropdownId);

  CihuyDataAPI(apiUrl, token, (error, response) => {
    if (error) {
      console.error("Terjadi kesalahan:", error);
    } else {
      // Bersihkan dropdown
      dropdown.innerHTML = "";

      // Isi dropdown dengan opsi-opsi dari data API
      response.data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id_kts;
        option.textContent = `${item.id_kts}. ${item.kts}`;
        dropdown.appendChild(option);
      });
    }
  });
}

function standarDropdown(apiUrlProdiUnit, dropdownId) {
  const dropdown = document.getElementById(dropdownId);

  CihuyDataAPI(apiUrlProdiUnit, token, (error, response) => {
    if (error) {
      console.error("Terjadi kesalahan:", error);
    } else {
      // Bersihkan dropdown
      dropdown.innerHTML = "";

      // Isi dropdown dengan opsi-opsi dari data API
      response.data.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = item.id_standar;
        option.textContent = `${index + 1}. ${item.standar}`;
        dropdown.appendChild(option);
      });
    }
  });
}

function indikatorDropdown(apiUrlProdiUnit, dropdownId) {
  const dropdown = document.getElementById(dropdownId);

  CihuyDataAPI(apiUrlProdiUnit, token, (error, response) => {
    if (error) {
      console.error("Terjadi kesalahan:", error);
    } else {
      // Bersihkan dropdown
      dropdown.innerHTML = "";

      // Isi dropdown dengan opsi-opsi dari data API
      response.data.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = item.id_indikator;
        option.textContent = `${index + 1}. ${item.isi_indikator}`;
        dropdown.appendChild(option);
      });
    }
  });
}
// indikatorDropdown(UrlGetStandar, "indikator");

indikatorDropdown(apiUrlProdiUnit, "indikator");

standarDropdown(apiUrlProdiUnit, "id_standar");
ktsdropdown(UrlGetKts, "id_kts");
