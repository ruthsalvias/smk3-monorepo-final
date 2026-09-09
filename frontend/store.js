import { configureStore } from "@reduxjs/toolkit";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
} from "./features/auth/states/reducer";
import {
  isChangeProfilePasswordReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoActionCreator,
  profileReducer,
  usersReducer,
  userReducer,
  isProfileReducer,
} from "./features/users/states/reducer";
import * as todoReducer from "./features/todos/states/reducer";

const store = configureStore({
  reducer: {
    // Auth reducers
    isAuthLogin: isAuthLoginReducer,
    isAuthRegister: isAuthRegisterReducer,

    // Users reducers
    users: usersReducer,
    user: userReducer,
    profile: profileReducer,
    isProfile: isProfileReducer,
    isChangeProfile: isChangeProfileReducer,
    isChangeProfilePhoto: isChangeProfilePhotoActionCreator,
    isChangeProfilePassword: isChangeProfilePasswordReducer,

    // Todos reducers
    todos: todoReducer.todosReducer,
    todo: todoReducer.todoReducer,
    isTodo: todoReducer.isTodoReducer,
    isTodoAdd: todoReducer.isTodoAddReducer,
    isTodoAdded: todoReducer.isTodoAddedReducer,
    isTodoChange: todoReducer.isTodoChangeReducer,
    isTodoChanged: todoReducer.isTodoChangedReducer,
    isTodoChangeCover: todoReducer.isTodoChangeCoverReducer,
    isTodoChangedCover: todoReducer.isTodoChangedCoverReducer,
    isTodoDeleted: todoReducer.isTodoDeletedReducer,
  },
});

export default store;
