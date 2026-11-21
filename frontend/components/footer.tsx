import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">LeadCRM</span>
                <span className="block text-xs font-semibold uppercase text-blue-400">Enterprise Solution</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Streamline lead pipelines, accelerate conversions, and track key business metrics with a secure,
              production-ready management platform.
            </p>
            {/* Social & Professional Links */}
            <div className="pt-2">
              <span className="text-xs font-medium uppercase text-gray-500 tracking-wider block mb-3">
                Connect with Author
              </span>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/POWER-WORLD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="GitHub Profile (POWER-WORLD)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/pawankumar101/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="LinkedIn Profile (pawankumar101)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75c.97 0 1.76.78 1.76 1.75 0 .97-.79 1.76-1.76 1.76m1.37 9.74v-8.37H5.09v8.37h2.74z" />
                  </svg>
                </a>
                <a
                  href="https://leetcode.com/u/pk3253702/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="LeetCode Profile (pk3253702)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                  </svg>
                </a>
                <a
                  href="https://pawankumar.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Author Portfolio Website (pawankumar.info)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Application Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard Analytics
                </Link>
              </li>
              <li>
                <Link href="/leads" className="text-gray-400 hover:text-white transition-colors">
                  Leads Directory
                </Link>
              </li>
              <li>
                <Link href="/leads/new" className="text-gray-400 hover:text-white transition-colors">
                  Create New Lead
                </Link>
              </li>
              <li>
                <a
                  href="https://leadcrm101.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Production Frontend</span>
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Backend & Deployment */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">API & Architecture</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://leadcrm-backend101.onrender.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Production API Service (Render)</span>
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://leadcrm-backend101.onrender.com/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>API Health Status</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </a>
              </li>
              <li>
                <span className="text-gray-400">Stack: Next.js 15, React 19, TypeScript</span>
              </li>
              <li>
                <span className="text-gray-400">Backend: Express.js, MongoDB Atlas</span>
              </li>
            </ul>
          </div>

          {/* Author Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Engineer Information</h3>
            <p className="text-sm text-gray-400 mb-3">
              Crafted by <strong>Pawan Kumar</strong>, Software Developer.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://pawankumar.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <span>pawankumar.info</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/POWER-WORLD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  GitHub: POWER-WORLD
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/pawankumar101/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LinkedIn: /in/pawankumar101
                </a>
              </li>
              <li>
                <a
                  href="https://leetcode.com/u/pk3253702/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LeetCode: /u/pk3253702
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {currentYear} LeadCRM System. Designed and engineered for high-performance lead operations.</p>
          <div className="flex items-center space-x-2 mt-3 sm:mt-0">
            <span>Built by</span>
            <a
              href="https://pawankumar.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white underline transition-colors"
            >
              Pawan Kumar
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
