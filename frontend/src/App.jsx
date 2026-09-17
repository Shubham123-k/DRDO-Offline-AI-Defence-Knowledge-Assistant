import ClientSecurityGuard from "./components/common/ClientSecurityGuard";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <ClientSecurityGuard />
      <AppRoutes />
    </>
  );
}

export default App;