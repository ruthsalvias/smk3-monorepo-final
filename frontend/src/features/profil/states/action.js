import profilApi from "../api/profilApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const ActionType = {
  SET_SEJARAH_IDENTITAS: "SET_SEJARAH_IDENTITAS",
  SET_VISI_MISI: "SET_VISI_MISI",
  SET_STRUKTUR_ORGANISASI: "SET_STRUKTUR_ORGANISASI",
  SET_FASILITAS: "SET_FASILITAS",
  SET_PRESTASI: "SET_PRESTASI",
  SET_PROGRAM_KEAHLIAN: "SET_PROGRAM_KEAHLIAN",
  SET_MITRA_KERJASAMA: "SET_MITRA_KERJASAMA",
  SET_PROFIL_LOADING: "SET_PROFIL_LOADING",
};

// Sync creators
export const setSejarahIdentitas = (d) => ({ type: ActionType.SET_SEJARAH_IDENTITAS, payload: d });
export const setVisiMisi = (d) => ({ type: ActionType.SET_VISI_MISI, payload: d });
export const setStrukturOrganisasi = (d) => ({ type: ActionType.SET_STRUKTUR_ORGANISASI, payload: d });
export const setFasilitas = (d) => ({ type: ActionType.SET_FASILITAS, payload: d });
export const setPrestasi = (d) => ({ type: ActionType.SET_PRESTASI, payload: d });
export const setProgramKeahlian = (d) => ({ type: ActionType.SET_PROGRAM_KEAHLIAN, payload: d });
export const setMitraKerjasama = (d) => ({ type: ActionType.SET_MITRA_KERJASAMA, payload: d });
export const setProfilLoading = (s) => ({ type: ActionType.SET_PROFIL_LOADING, payload: s });

// ── GET ──────────────────────────────────────────────────────
export function asyncGetSejarahIdentitas() {
  return async (dispatch) => {
    try { dispatch(setSejarahIdentitas(await profilApi.getSejarahIdentitas())); }
    catch { dispatch(setSejarahIdentitas([])); }
  };
}
export function asyncGetVisiMisi() {
  return async (dispatch) => {
    try { dispatch(setVisiMisi(await profilApi.getVisiMisi())); }
    catch { dispatch(setVisiMisi([])); }
  };
}
export function asyncGetStrukturOrganisasi() {
  return async (dispatch) => {
    try { dispatch(setStrukturOrganisasi(await profilApi.getStrukturOrganisasi())); }
    catch { dispatch(setStrukturOrganisasi([])); }
  };
}
export function asyncGetFasilitas() {
  return async (dispatch) => {
    try { dispatch(setFasilitas(await profilApi.getFasilitas())); }
    catch { dispatch(setFasilitas([])); }
  };
}
export function asyncGetPrestasi() {
  return async (dispatch) => {
    try { dispatch(setPrestasi(await profilApi.getPrestasi())); }
    catch { dispatch(setPrestasi([])); }
  };
}
export function asyncGetProgramKeahlian() {
  return async (dispatch) => {
    try { dispatch(setProgramKeahlian(await profilApi.getProgramKeahlian())); }
    catch { dispatch(setProgramKeahlian([])); }
  };
}
export function asyncGetMitraKerjasama() {
  return async (dispatch) => {
    try { dispatch(setMitraKerjasama(await profilApi.getMitraKerjasama())); }
    catch { dispatch(setMitraKerjasama([])); }
  };
}

// ── LOAD SEMUA SEKALIGUS ──────────────────────────────────────
export function asyncLoadAllProfilData() {
  return async (dispatch) => {
    dispatch(setProfilLoading(true));
    await Promise.all([
      dispatch(asyncGetSejarahIdentitas()),
      dispatch(asyncGetVisiMisi()),
      dispatch(asyncGetStrukturOrganisasi()),
      dispatch(asyncGetFasilitas()),
      dispatch(asyncGetPrestasi()),
      dispatch(asyncGetProgramKeahlian()),
      dispatch(asyncGetMitraKerjasama()),
    ]);
    dispatch(setProfilLoading(false));
  };
}

// ── POST / PUT / DELETE ───────────────────────────────────────
export function asyncPostSejarahIdentitas(tahun_berdiri, deskripsi, cb) {
  return async (dispatch) => {
    try { await profilApi.postSejarahIdentitas(tahun_berdiri, deskripsi); showSuccessDialog("Data berhasil ditambahkan"); dispatch(asyncGetSejarahIdentitas()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutSejarahIdentitas(id, tahun_berdiri, deskripsi, cb) {
  return async (dispatch) => {
    try { await profilApi.putSejarahIdentitas(id, tahun_berdiri, deskripsi); showSuccessDialog("Data berhasil diperbarui"); dispatch(asyncGetSejarahIdentitas()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeleteSejarahIdentitas(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deleteSejarahIdentitas(id); showSuccessDialog("Data berhasil dihapus"); dispatch(asyncGetSejarahIdentitas()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}

export function asyncPostVisiMisi(tipe, deskripsi, cb) {
  return async (dispatch) => {
    try { await profilApi.postVisiMisi(tipe, deskripsi); showSuccessDialog("Berhasil ditambahkan"); dispatch(asyncGetVisiMisi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutVisiMisi(id, tipe, deskripsi, cb) {
  return async (dispatch) => {
    try { await profilApi.putVisiMisi(id, tipe, deskripsi); showSuccessDialog("Berhasil diperbarui"); dispatch(asyncGetVisiMisi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeleteVisiMisi(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deleteVisiMisi(id); showSuccessDialog("Berhasil dihapus"); dispatch(asyncGetVisiMisi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}

export function asyncPostStrukturOrganisasi(file, cb) {
  return async (dispatch) => {
    try { await profilApi.postStrukturOrganisasi(file); showSuccessDialog("Gambar berhasil diupload"); dispatch(asyncGetStrukturOrganisasi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutStrukturOrganisasi(id, file, cb) {
  return async (dispatch) => {
    try { await profilApi.putStrukturOrganisasi(id, file); showSuccessDialog("Gambar berhasil diperbarui"); dispatch(asyncGetStrukturOrganisasi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeleteStrukturOrganisasi(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deleteStrukturOrganisasi(id); showSuccessDialog("Berhasil dihapus"); dispatch(asyncGetStrukturOrganisasi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}

export function asyncPostFasilitas(nama, deskripsi, foto, cb) {
  return async (dispatch) => {
    try { await profilApi.postFasilitas(nama, deskripsi, foto); showSuccessDialog("Fasilitas berhasil ditambahkan"); dispatch(asyncGetFasilitas()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutFasilitas(id, nama, deskripsi, foto, cb) {
  return async (dispatch) => {
    try { await profilApi.putFasilitas(id, nama, deskripsi, foto); showSuccessDialog("Fasilitas berhasil diperbarui"); dispatch(asyncGetFasilitas()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeleteFasilitas(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deleteFasilitas(id); showSuccessDialog("Fasilitas berhasil dihapus"); dispatch(asyncGetFasilitas()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}

export function asyncPostPrestasi(judul, tingkat, tahun, keterangan, cb) {
  return async (dispatch) => {
    try { await profilApi.postPrestasi(judul, tingkat, tahun, keterangan); showSuccessDialog("Prestasi berhasil ditambahkan"); dispatch(asyncGetPrestasi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutPrestasi(id, judul, tingkat, tahun, keterangan, cb) {
  return async (dispatch) => {
    try { await profilApi.putPrestasi(id, judul, tingkat, tahun, keterangan); showSuccessDialog("Prestasi berhasil diperbarui"); dispatch(asyncGetPrestasi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeletePrestasi(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deletePrestasi(id); showSuccessDialog("Prestasi berhasil dihapus"); dispatch(asyncGetPrestasi()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}

export function asyncPostProgramKeahlian(nama, deskripsi, icon, cb) {
  return async (dispatch) => {
    try { await profilApi.postProgramKeahlian(nama, deskripsi, icon); showSuccessDialog("Program keahlian berhasil ditambahkan"); dispatch(asyncGetProgramKeahlian()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutProgramKeahlian(id, nama, deskripsi, icon, cb) {
  return async (dispatch) => {
    try { await profilApi.putProgramKeahlian(id, nama, deskripsi, icon); showSuccessDialog("Program keahlian berhasil diperbarui"); dispatch(asyncGetProgramKeahlian()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeleteProgramKeahlian(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deleteProgramKeahlian(id); showSuccessDialog("Program keahlian berhasil dihapus"); dispatch(asyncGetProgramKeahlian()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}

export function asyncPostMitraKerjasama(nama, deskripsi, logo, cb) {
  return async (dispatch) => {
    try { await profilApi.postMitraKerjasama(nama, deskripsi, logo); showSuccessDialog("Mitra berhasil ditambahkan"); dispatch(asyncGetMitraKerjasama()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncPutMitraKerjasama(id, nama, deskripsi, logo, cb) {
  return async (dispatch) => {
    try { await profilApi.putMitraKerjasama(id, nama, deskripsi, logo); showSuccessDialog("Mitra berhasil diperbarui"); dispatch(asyncGetMitraKerjasama()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
export function asyncDeleteMitraKerjasama(id, cb) {
  return async (dispatch) => {
    try { await profilApi.deleteMitraKerjasama(id); showSuccessDialog("Mitra berhasil dihapus"); dispatch(asyncGetMitraKerjasama()); if (cb) cb(); }
    catch (e) { showErrorDialog(e.message); }
  };
}
