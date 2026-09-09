import { ActionType } from "./action";

export function siswaReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_SISWA:
      return action.payload;
    default:
      return state;
  }
}

export function guruReducer(state = [], action) {
  switch (action.type) {
    case ActionType.SET_GURU:
      return action.payload;
    default:
      return state;
  }
}

export function statsSiswaReducer(state = {}, action) {
  switch (action.type) {
    case ActionType.SET_STATS_SISWA:
      return action.payload;
    default:
      return state;
  }
}

export function manajemenLoadingReducer(state = false, action) {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return action.payload;
    default:
      return state;
  }
}

export function hasMoreSiswaReducer(state = false, action) {
  switch (action.type) {
    case ActionType.SET_HAS_MORE_SISWA:
      return action.payload;
    default:
      return state;
  }
}

export function hasMoreGuruReducer(state = false, action) {
  switch (action.type) {
    case ActionType.SET_HAS_MORE_GURU:
      return action.payload;
    default:
      return state;
  }
}