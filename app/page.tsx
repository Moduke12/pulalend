import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-blue to-blue-500 p-2 shadow-lg">
                <Image src="/logo3.jpeg" alt="Pulalend" width={48} height={48} className="rounded-xl" />
              </div>
              <div>
                <div className="font-bold text-xl text-navy-deep tracking-tight">PULALEND</div>
                <div className="text-xs">
                  <span className="text-gray-600">the smart </span>
                  <span className="text-accent-orange font-semibold">lender</span>
                </div>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/" className="text-sm text-gray-600 hover:text-primary-blue px-3 py-1">
                Verify Payments
              </Link>
              <Link href="/login" className="text-sm text-gray-600 hover:text-primary-blue px-3 py-1">
                Forgot Username or Password?
              </Link>
              <Link href="/register" className="text-sm text-primary-blue hover:text-blue-700 px-3 py-1 font-medium">
                Register
              </Link>
              <input
                type="text"
                placeholder="Email or Phone"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none w-40"
              />
              <input
                type="password"
                placeholder="Password"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-blue focus:border-primary-blue outline-none w-32"
              />
              <Link
                href="/login"
                className="px-6 py-2 bg-navy-deep text-white rounded-lg hover:bg-slate-900 transition font-medium text-sm"
              >
                Login
              </Link>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="border-t border-gray-200 overflow-x-auto">
            <div className="flex items-center gap-1 text-sm py-3">
              <Link href="/" className="px-4 py-2 text-navy-deep font-medium border-b-2 border-primary-blue hover:bg-blue-50 rounded-t-lg transition whitespace-nowrap">
                Home
              </Link>
              <Link href="/borrower/apply" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                Borrow
              </Link>
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                How It Works
              </Link>
              <Link href="/borrower/repayments" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                Repayments
              </Link>
              <Link href="/lender/opportunities" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                For Partners
              </Link>
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                Resources & Tools
              </Link>
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                About Pulalend
              </Link>
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                Contact Us
              </Link>
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-navy-deep hover:bg-gray-50 rounded-t-lg transition whitespace-nowrap">
                Careers
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Trust Badge */}
      <div className="bg-navy-deep text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <svg className="w-5 h-5 text-growth-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Licensed & Regulated</span>
            <span className="mx-2">•</span>
            <span>Building trust in responsible lending across Botswana.</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-8">
          {/* Left Content */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
              <svg className="w-5 h-5 text-primary-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700">Where big dreams grow, Pulalend delivers.</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-navy-deep leading-snug">
              Borrow smart,<br />
              build a better future.
            </h1>

            <p className="text-base text-gray-600 leading-relaxed">
              Quick, reliable loans that help you achieve your goals.<br />
              Apply in minutes, repay with confidence and grow with trust.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3 bg-gradient-to-r from-primary-blue via-blue-500 to-growth-green text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2 text-sm"
              >
                Get Started Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <button className="px-6 py-3 border-2 border-primary-blue text-primary-blue rounded-xl font-semibold hover:bg-blue-50 transition flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                How It Works
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/p2.jpeg"
                alt="Pulalend student"
                width={550}
                height={500}
                className="w-full h-auto object-cover max-h-[450px]"
              />
            </div>
            <div className="absolute bottom-8 right-8 bg-navy-deep/95 backdrop-blur-sm text-white rounded-2xl p-4 shadow-xl max-w-[240px]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-growth-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-growth-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm mb-0.5">Trusted & Secure</div>
                  <div className="text-xs text-white/90 leading-relaxed">
                    Your data is safe with Pulalend&apos;s secure platform.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link href="/borrower/apply" className="bg-primary-blue hover:bg-blue-700 text-white rounded-2xl p-5 text-center transition group shadow-lg">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
              </svg>
            </div>
            <div className="font-bold mb-1">Borrow</div>
            <div className="text-xs text-white/80">Apply for a loan</div>
          </Link>

          <Link href="/lender/opportunities" className="bg-growth-green hover:bg-green-700 text-white rounded-2xl p-5 text-center transition group shadow-lg">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="font-bold mb-1">Invest</div>
            <div className="text-xs text-white/80">Grow your money</div>
          </Link>

          <Link href="/borrower/repayments" className="bg-accent-orange hover:bg-orange-700 text-white rounded-2xl p-5 text-center transition group shadow-lg">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="font-bold mb-1">Repay</div>
            <div className="text-xs text-white/80">Make payments</div>
          </Link>

          <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-5 text-center transition group shadow-lg">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="font-bold mb-1">Why Pulalend</div>
            <div className="text-xs text-white/80">Safe & transparent</div>
          </Link>

          <Link href="/" className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl p-5 text-center transition group shadow-lg">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <div className="font-bold mb-1">Product Shop</div>
            <div className="text-xs text-white/80">Offers & tools</div>
          </Link>
        </div>

        {/* Three Cards Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-navy-deep to-slate-800 text-white rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-44">
              <Image
                src="/p3.jpeg"
                alt="For Me"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/50 to-transparent" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-2">For Me</h3>
              <p className="text-white/80 mb-3 text-sm">
                Quick loans for personal needs and opportunities.
              </p>
              <Link href="/register?type=borrower" className="inline-flex items-center gap-2 text-white hover:text-growth-green transition text-sm font-medium">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-700 to-green-900 text-white rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-44">
              <Image
                src="/p1.jpeg"
                alt="For My Business"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/50 to-transparent" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-2">For My Business</h3>
              <p className="text-white/80 mb-3 text-sm">
                Flexible funding to grow and manage your business.
              </p>
              <Link href="/register?type=borrower" className="inline-flex items-center gap-2 text-white hover:text-accent-orange transition text-sm font-medium">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-3xl overflow-hidden shadow-xl">
            <div className="relative h-44">
              <Image
                src="/p2.jpeg"
                alt="For Partners"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-800 via-orange-800/50 to-transparent" />
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-2">For Partners</h3>
              <p className="text-white/80 mb-3 text-sm">
                Collaborate with Pulalend and unlock opportunities.
              </p>
              <Link href="/register?type=lender" className="inline-flex items-center gap-2 text-white hover:text-blue-300 transition text-sm font-medium">
                Learn More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-bold text-amber-900 text-base">Borrow Responsibly:</div>
              <div className="text-amber-800">Smart borrowing today leads to a stronger future tomorrow.</div>
            </div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="mt-20 mb-16">
          {/* Journey Banner with Footprints */}
          <div className="relative rounded-3xl overflow-hidden mb-12 h-64">
            <Image
              src="/pay-on-time.jpeg"
              alt="Your journey with Pulalend"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/70 to-transparent flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold text-white mb-3">Your Journey Starts Here</h2>
                  <p className="text-white/90 text-lg">
                    Every step you take with Pulalend brings you closer to your dreams. Join thousands who have transformed their lives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy-deep mb-3">Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real people, real dreams achieved. See how Pulalend has helped borrowers build better futures.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Success Story 1 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-80">
                <Image
                  src="/p3.jpeg"
                  alt="Thabo's success story"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">5.0</span>
                </div>
                <h3 className="text-xl font-bold text-navy-deep mb-2">Thabo M.</h3>
                <p className="text-gray-600 mb-3">
                  "Pulalend helped me start my small business. The process was quick and transparent. Within days, I had the funds to purchase inventory. Now my business is thriving!"
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-growth-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Borrower</span>
                </div>
              </div>
            </div>

            {/* Success Story 2 */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-80">
                <Image
                  src="/p4.jpeg"
                  alt="David's success story"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">5.0</span>
                </div>
                <h3 className="text-xl font-bold text-navy-deep mb-2">David K.</h3>
                <p className="text-gray-600 mb-3">
                  "I needed funds for an emergency and Pulalend was there when I needed them most. The repayment terms were fair and manageable. Highly recommend!"
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4 text-growth-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Borrower</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-12 bg-gradient-to-r from-primary-blue to-growth-green rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-3">Ready to Write Your Success Story?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied borrowers who have achieved their dreams with Pulalend. Apply today and take the first step toward a brighter future.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-blue rounded-xl font-semibold hover:shadow-lg transition"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-navy-deep text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/60 text-sm">
            © 2026 Pulalend. All rights reserved. | Building trust in responsible lending across Botswana.
          </p>
        </div>
      </footer>
    </div>
  );
}
