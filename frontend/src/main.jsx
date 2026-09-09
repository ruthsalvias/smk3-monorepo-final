import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { SiteSettingsProvider } from "./features/profil/context/SiteSettingsContext";
import "./features/profil/resources/custom.css";
import "./features/profil/resources/theme.css";
import "./features/admin/resources/admin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);