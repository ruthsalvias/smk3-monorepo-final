import { ActionType } from "./action";

export function sejarahIdentitasReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_SEJARAH_IDENTITAS: return action.payload;
    default: return state;
  }
}
export function visiMisiReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_VISI_MISI: return action.payload;
    default: return state;
  }
}
export function strukturOrganisasiReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_STRUKTUR_ORGANISASI: return action.payload;
    default: return state;
  }
}
export function fasilitasReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_FASILITAS: return action.payload;
    default: return state;
  }
}
export function prestasiReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_PRESTASI: return action.payload;
    default: return state;
  }
}
export function programKeahlianReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_PROGRAM_KEAHLIAN: return action.payload;
    default: return state;
  }
}
export function mitraKerjasamaReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_MITRA_KERJASAMA: return action.payload;
    default: return state;
  }
}
export function profilLoadingReducer(state = false, action) {
  switch (action.type) {
    case ActionType.SET_PROFIL_LOADING: return action.payload;
    default: return state;
  }
}
