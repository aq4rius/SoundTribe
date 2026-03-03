import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';

/**
 * App layout — authenticated shell with Navbar and Footer.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <section id="main-content" className="pt-24">{children}</section>
      <Footer />
    </>
  );
}
