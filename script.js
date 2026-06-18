// ==========================================
// 1. LOGIKA BUKA TUTUP MODAL (TARUH PALING ATAS BIAR AMAN)
// ==========================================
const btnArtefak = document.getElementById("btn-add-artefak");
const btnCert = document.getElementById("btn-add-cert");
const modalArtefak = document.getElementById("modal-artefak");
const modalCert = document.getElementById("modal-cert");

// Fungsi Buka Modal Artefak
if (btnArtefak && modalArtefak) {
  btnArtefak.addEventListener("click", () => {
    modalArtefak.classList.add("active");
  });
}

// Fungsi Buka Modal Credential
if (btnCert && modalCert) {
  btnCert.addEventListener("click", () => {
    modalCert.classList.add("active");
  });
}

// Fungsi Tutup Modal
document.querySelectorAll(".close-modal, .close-modal-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.target.closest(".modal-bg").classList.remove("active");
  });
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-bg")) {
    e.target.classList.remove("active");
  }
});

// ==========================================
// 2. INISIALISASI SUPABASE
// ==========================================
let supabase;
try {
  // GANTI DUA BARIS INI DENGAN DATA DARI SUPABASE-MU YA!
  const supabaseUrl = "URL_PROJECT_SUPABASE_KAMU";
  const supabaseKey = "API_KEY_ANON_SUPABASE_KAMU";

  if (supabaseUrl !== "URL_PROJECT_SUPABASE_KAMU") {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
} catch (err) {
  console.log("Supabase belum di-setup, tapi UI tetap jalan.");
}

// ==========================================
// 3. LOGIKA UPLOAD & PUBLISH ARTEFAK
// ==========================================
const artFileInput = document.getElementById("art-file");
const fileNameDisplay = document.getElementById("file-name-display");
const btnPublishArt = document.getElementById("btn-publish-artefak");

if (artFileInput) {
  artFileInput.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      fileNameDisplay.innerText = e.target.files[0].name;
      fileNameDisplay.style.color = "#3a2d4a";
      fileNameDisplay.style.fontWeight = "bold";
    }
  });
}

if (btnPublishArt) {
  btnPublishArt.addEventListener("click", async () => {
    if (!supabase) return alert("Supabase belum dihubungkan!");

    const judul = document.getElementById("art-judul").value;
    const file = artFileInput.files[0];

    if (!judul) {
      alert("Judulnya diisi dulu ya!");
      return;
    }

    btnPublishArt.innerText = "loading... ⏳";
    btnPublishArt.disabled = true;

    try {
      let file_url = "";

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("berkas")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("berkas")
          .getPublicUrl(fileName);
        file_url = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("artefak")
        .insert([{ judul: judul, file_url: file_url }]);

      if (error) throw error;

      alert("Artefak berhasil dipublish! ✦");
      modalArtefak.classList.remove("active");

      document.getElementById("art-judul").value = "";
      artFileInput.value = "";
      fileNameDisplay.innerText = "png, jpg, pdf, docx, txt";
      fileNameDisplay.style.fontWeight = "normal";
    } catch (error) {
      console.error(error);
      alert("Waduh, gagal publish: " + error.message);
    } finally {
      btnPublishArt.innerText = "publish ✦";
      btnPublishArt.disabled = false;
    }
  });
}

// ==========================================
// 4. LOGIKA UPLOAD & PUBLISH CREDENTIAL
// ==========================================
const certFileInput = document.getElementById("cert-file");
const certFileNameDisplay = document.getElementById("cert-file-name");
const btnPublishCert = document.getElementById("btn-publish-cert");

if (certFileInput) {
  certFileInput.addEventListener("change", function (e) {
    if (e.target.files.length > 0) {
      certFileNameDisplay.innerText = e.target.files[0].name;
      certFileNameDisplay.style.color = "#3a2d4a";
      certFileNameDisplay.style.fontWeight = "bold";
    }
  });
}

if (btnPublishCert) {
  btnPublishCert.addEventListener("click", async () => {
    if (!supabase) return alert("Supabase belum dihubungkan!");

    const judul = document.getElementById("cert-judul").value;
    const issuer = document.getElementById("cert-issuer").value;
    const file = certFileInput.files[0];

    if (!judul || !issuer) {
      alert("Judul dan penerbitnya diisi dulu ya!");
      return;
    }

    btnPublishCert.innerText = "loading... ⏳";
    btnPublishCert.disabled = true;

    try {
      let file_url = "";

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `cert_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("berkas")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("berkas")
          .getPublicUrl(fileName);
        file_url = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("sertifikat")
        .insert([{ judul: judul, issuer: issuer, file_url: file_url }]);

      if (error) throw error;

      alert("Sertifikat berhasil dipublish! ✦");
      document.getElementById("modal-cert").classList.remove("active");

      document.getElementById("cert-judul").value = "";
      document.getElementById("cert-issuer").value = "";
      certFileInput.value = "";
      certFileNameDisplay.innerText = "png, jpg, pdf";
      certFileNameDisplay.style.fontWeight = "normal";
    } catch (error) {
      console.error(error);
      alert("Waduh, gagal publish: " + error.message);
    } finally {
      btnPublishCert.innerText = "publish ✦";
      btnPublishCert.disabled = false;
    }
  });
}
