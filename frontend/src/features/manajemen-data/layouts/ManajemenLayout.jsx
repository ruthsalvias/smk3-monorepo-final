import Navbar from "../components/NavbarComponent";
import Footer from "../components/FooterComponent";

export default function ManajemenLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="smk-main">{children}</main>
      <Footer />
    </>
  );
}
