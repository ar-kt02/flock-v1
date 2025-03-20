import Link from "next/link";
import { Mail, Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Flock!</h3>
            <p className="text-purple-100 mb-4">
              Discover and enjoy the best events happening around you. From creative food pop-ups to
              pottery classes, find experiences that match your interests.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                className="text-white hover:text-purple-200 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://facebook.com"
                className="text-white hover:text-purple-200 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                className="text-white hover:text-purple-200 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-purple-100 hover:text-white transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-purple-100 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="hidden md:block">
            <h3 className="text-xl font-bold mb-4">Top Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/events?category=Music"
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  Music
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=Sports"
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  Sports
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=Technology"
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=Arts"
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  Arts
                </Link>
              </li>
              <li>
                <Link
                  href="/events?category=Business"
                  className="text-purple-100 hover:text-white transition-colors"
                >
                  Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <p className="flex items-center text-purple-100">
                <Mail size={18} className="mr-2" />
                <a href="mailto:flock@example.com" className="hover:text-white transition-colors">
                  flock@example.com
                </a>
              </p>
              <p className="text-purple-100">
                1 Example Rd.
                <br />
                London, AA9A 9AA
                <br />
                United Kingdom
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-white text-purple-600 hover:bg-purple-50 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-purple-600 bg-purple-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-100 text-sm">
              &copy; {currentYear} Flock! All rights reserved.
            </p>
            <ul className="flex flex-wrap gap-4 mt-4 md:mt-0 list-none p-0 justify-center">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-purple-100 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-purple-100 hover:text-white text-sm transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap"
                  className="text-purple-100 hover:text-white text-sm transition-colors"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-purple-100 hover:text-white text-sm transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
