import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom"
import LandingPageView from "../views/landing-page.view";
import FileHandleView from "../views/file-handle.view";
import PageNotFound from "../views/page-not-found.view";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileHandleView />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;