import { Routes, Route, useNavigate } from "react-router-dom";
// Material-UI imports
import Grid from "@mui/material/Grid";

//Msal Imports
import { MsalProvider } from "@azure/msal-react";
import { CustomNavigationClient } from "./utils/NavigationClient.js";

// Sample app imports
import { Profile } from "./page/Profile.jsx";
import { Login } from "./page/Login.jsx";
import { Logout } from "./page/Logout.jsx";
import { PageLayout } from "./ui-components/PageLayout.jsx";

// Class-based equivalents of "Profile" component
import { ProfileWithMsal } from "./page/ProfileWithMsal.jsx";
import { ProfileRawContext } from "./page/ProfileRawContext.jsx";
import { ProfileUseMsalAuthenticationHook } from "./page/ProfileUseMsalAuthenticationHook.jsx";

// Class-based equivalents of "Profile" component
import Reconocimiento from "./components/reconocimiento/index.jsx";
import Certificados from "./components/certificados/page.jsx";
import Marketplace from "./components/marketplaces/page.jsx";
import PrizeDetail from "./components/marketplaces/index.jsx";
import ReconocimientoExito from "./components/reconocimiento/page.jsx";
import IndexReconocimientos from "./components/solicitudes/reconocimiento/index.jsx";

function App({ pca }) {
  // The next 3 lines are optional. This is how you configure MSAL to take advantage of the router's navigate functions when MSAL redirects between pages in your app
  const navigate = useNavigate();
  const navigationClient = new CustomNavigationClient(navigate);
  pca.setNavigationClient(navigationClient);

  return (
    <MsalProvider instance={pca}>
      <PageLayout>
        <Grid container justifyContent="center">
          <Pages />
        </Grid>
      </PageLayout>
    </MsalProvider>
  );
}

function Pages() {
  return (
    <Routes>
      {/* Rutas de Inicio de Sesion */}
      <Route path="/" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/profileWithMsal" element={<ProfileWithMsal />} />
      <Route path="/profileRawContext" element={<ProfileRawContext />} />
      <Route
        path="/profileUseMsalAuthenticationHook"
        element={<ProfileUseMsalAuthenticationHook />}
      />
      <Route path="/logout" element={<Logout />} />
      <Route path="/reconocimiento" element={<Reconocimiento />} />
      <Route path="/reconocimientoExito" element={<ReconocimientoExito />} />
      <Route path="/certificados" element={<Certificados />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/marketplace/:id" element={<PrizeDetail />} />
      <Route path="/administrar/solicitudes" element={<IndexReconocimientos/>} />
    </Routes>
  );
}

export default App;