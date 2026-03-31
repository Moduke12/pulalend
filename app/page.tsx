import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-home-ambient text-navy-deep">
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -left-28 w-72 h-72 rounded-full bg-accent-orange/30 blur-3xl" />
        <div className="absolute top-12 -right-16 w-80 h-80 rounded-full bg-primary-blue/25 blur-3xl" />
        <div className="absolute bottom-0 right-20 w-64 h-64 rounded-full bg-growth-green/20 blur-3xl" />

        <nav className="relative z-10">
          <div className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/80 hero-surface flex items-center justify-center">
                <Image src="/logo3.jpeg" alt="Pulalend logo" width={40} height={40} className="rounded-xl" />
              </div>
              <div>
                <div className="font-display text-xl text-navy-deep">PULALEND</div>
                <div className="text-sm text-accent-orange">the smart lender</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-navy-deep border border-navy-deep/20 rounded-full hover:bg-navy-deep hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-gradient-to-r from-[#0B2242] to-[#1E73D8] text-white rounded-full hover:from-[#1E73D8] hover:to-[#0B2242] transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div className="space-y-8 fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hero-surface text-sm text-navy-deep">
                Smart lending for founders, traders, and funders
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-navy-deep">
                Where bold businesses meet confident capital.
              </h1>
              <p className="text-lg text-navy-deep/80 max-w-xl">
                Pulalend matches vetted borrowers with mission-aligned lenders. Launch funding requests, track approvals,
                and build a portfolio with clarity and control.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register?type=borrower"
                  className="px-6 py-3 bg-gradient-to-r from-[#1E73D8] to-[#38A34A] text-white rounded-full hover:from-[#0B2242] hover:to-[#1E73D8] transition"
                >
                  I Need Funding
                </Link>
                <Link
                  href="/register?type=lender"
                  className="px-6 py-3 border border-navy-deep/20 rounded-full text-navy-deep hover:bg-white/80 transition"
                >
                  I Want to Lend
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-navy-deep/70">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-growth-green" />
                  Verified profiles
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-orange" />
                  Transparent terms
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-blue" />
                  Smart repayments
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="hero-surface rounded-3xl p-6 grid gap-4 float-slow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-navy-deep/60">Brand suite</div>
                    <div className="font-display text-xl text-navy-deep">Pulalend Visuals</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-blue/10 glow-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <Image src="/logo1.jpeg" alt="Pulalend logo horizontal" width={240} height={120} className="rounded-xl" />
                  </div>
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <Image src="/logo2.jpeg" alt="Pulalend icon" width={240} height={120} className="rounded-xl" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <Image src="/logo3.jpeg" alt="Pulalend app badge" width={520} height={240} className="rounded-xl" />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-6 bg-white/85 hero-surface rounded-2xl px-5 py-4">
                <div className="text-xs uppercase tracking-wide text-navy-deep/60">Approval speed</div>
                <div className="font-display text-2xl text-navy-deep">48 hrs</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <section className="container mx-auto px-4 py-10">
        <div className="hero-surface rounded-3xl p-8 grid md:grid-cols-3 gap-6 stagger">
          {[
            {
              title: "Borrower Onboarding",
              text: "KYC-ready profiles, clean documents, and guided loan requests.",
            },
            {
              title: "Lender Matching",
              text: "Browse vetted opportunities, fund partially, and track expected returns.",
            },
            {
              title: "Transparent Repayments",
              text: "Clear schedules, automatic status updates, and shared visibility.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-navy-deep/5">
              <div className="font-display text-lg text-navy-deep mb-2">{item.title}</div>
              <p className="text-navy-deep/70 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 pb-10">
        <div className="hero-surface rounded-3xl p-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div className="space-y-6">
            <div className="font-display text-3xl text-navy-deep">
              Pay On Time, Build a Stronger Relationship.
            </div>
            <p className="text-navy-deep/70">
              When you repay on time, you grow with Pulalend. Let’s keep the trust strong and unlock even more
              opportunities together.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Builds Trust",
                  text: "Strengthens our relationship and keeps you in good standing.",
                },
                {
                  title: "Opens More Opportunities",
                  text: "Enjoy higher limits and access to faster future funding.",
                },
                {
                  title: "Peace of Mind",
                  text: "Stay stress-free with a positive repayment record.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="font-display text-lg text-navy-deep">{item.title}</div>
                    <div className="text-sm text-navy-deep/70">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/70 hero-surface text-sm text-navy-deep">
              Together we grow, with trust and commitment.
            </div>
          </div>
          <div className="bg-white/80 hero-surface rounded-2xl p-4">
            <Image
              src="/pay-on-time.jpeg"
              alt="Pulalend repayment awareness poster"
              width={520}
              height={700}
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="font-display text-3xl text-navy-deep">A platform built for growth with guardrails.</div>
            <p className="text-navy-deep/70">
              Every loan request is reviewed by admins before it enters the marketplace, creating trust for lenders and
              predictable outcomes for borrowers.
            </p>
            <Link href="/register" className="inline-flex px-6 py-3 bg-gradient-to-r from-[#F28C28] to-[#F6B24B] text-white rounded-full hover:from-[#e07a18] hover:to-[#F28C28] transition">
              Start Your Journey
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {["/logo1.jpeg", "/logo2.jpeg", "/logo3.jpeg"].map((src) => (
              <div key={src} className="bg-white/80 hero-surface rounded-2xl p-4 shadow-md">
                <Image src={src} alt="Pulalend logo" width={240} height={160} className="rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl chatbot-surface p-8">
          <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-accent-orange/20 blur-3xl" />
          <div className="absolute bottom-0 -left-12 w-56 h-56 rounded-full bg-primary-blue/20 blur-3xl" />
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center relative z-10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs text-navy-deep">
                FAQ chatbot
              </div>
              <div className="font-display text-3xl text-navy-deep">Got questions? Ask the Pulalend assistant.</div>
              <p className="text-navy-deep/70">
                Skip the long FAQ list. Our chatbot answers lender, borrower, and KYC questions in seconds.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-navy-deep/70">
                {["Loan approvals", "Repayment schedules", "KYC checks", "Investor returns"].map((chip) => (
                  <span key={chip} className="px-3 py-1 rounded-full bg-white/80 border border-navy-deep/10">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-navy-deep/10 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-navy-deep/10 flex items-center justify-between">
                <div>
                  <div className="font-display text-lg text-navy-deep">Pulalend Chat</div>
                  <div className="text-xs text-navy-deep/60">Always on, answers fast</div>
                </div>
                <span className="text-xs text-white bg-navy-deep px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-blue/10 text-primary-blue flex items-center justify-center font-bold">
                    P
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-navy-deep">
                    Hi! Ask me about KYC, repayments, or how to pick the right lender.
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary-blue text-white rounded-2xl px-4 py-3 text-sm max-w-xs">
                    How long does approval usually take?
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent-orange/20 text-accent-orange flex items-center justify-center font-bold">
                    A
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-navy-deep">
                    Most requests are reviewed within 48 hours. You will see updates in your borrower dashboard.
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-navy-deep/10 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    className="flex-1 px-4 py-2 rounded-full border border-navy-deep/10 focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
                    placeholder="Type your question..."
                  />
                  <button className="px-4 py-2 bg-primary-blue text-white rounded-full hover:bg-navy-deep transition">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-deep/10 bg-white/70">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-display text-lg text-navy-deep">Pulalend</div>
            <div className="text-sm text-navy-deep/60">the smart lender</div>
          </div>
          <div className="flex items-center gap-6 text-sm text-navy-deep/70">
            <Link href="/terms" className="hover:text-primary-blue transition">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
