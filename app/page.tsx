import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hero-deck text-navy-deep">
      <div className="relative overflow-hidden">
        <div className="absolute -top-28 -left-32 w-96 h-96 rounded-full bg-accent-orange/45 blur-3xl" />
        <div className="absolute top-6 -right-24 w-[26rem] h-[26rem] rounded-full bg-primary-blue/35 blur-3xl float-slow" />
        <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-growth-green/28 blur-3xl float-delay" />

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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hero-surface text-sm text-navy-deep surface-tint-orange">
                Where big banks fail, Pulalend delivers.
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-navy-deep">
                Get same-day approval for borrower funding up to P10k.
              </h1>
              <p className="text-lg text-navy-deep/80 max-w-xl">
                Move fast with verified lenders and a streamlined approval process. Apply in minutes, track your status,
                and fund your growth without the usual paperwork drag.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register?type=borrower"
                  className="px-6 py-3 bg-gradient-to-r from-[#1E73D8] to-[#38A34A] text-white rounded-full hover:from-[#0B2242] hover:to-[#1E73D8] transition"
                >
                  Get Approved Now
                </Link>
                <Link
                  href="/register?type=lender"
                  className="px-6 py-3 border border-navy-deep/20 rounded-full text-navy-deep hover:bg-white/80 transition"
                >
                  See Investment Deals
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Avg. approval", value: "48 hrs", tint: "surface-tint-blue" },
                  { label: "Funding range", value: "P1k-P10k", tint: "surface-tint-orange" },
                  { label: "Live lender pool", value: "1,200+", tint: "surface-tint-green" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl p-4 hero-surface ${stat.tint}`}>
                    <div className="text-xs uppercase tracking-wide text-navy-deep/60">{stat.label}</div>
                    <div className="font-display text-xl text-navy-deep">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative fade-up-long">
              <div className="hero-surface rounded-3xl p-6 grid gap-4 float-slow shimmer-overlay relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-navy-deep/60">Brand suite</div>
                    <div className="font-display text-xl text-navy-deep">Pulalend Visuals</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary-blue/10 glow-ring glow-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <Image src="/logo1.jpeg" alt="Pulalend logo horizontal" width={150} height={75} className="rounded-xl" />
                  </div>
                  <div className="bg-white rounded-2xl p-3 shadow-lg">
                    <Image src="/logo2.jpeg" alt="Pulalend icon" width={150} height={75} className="rounded-xl" />
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <Image src="/logo3.jpeg" alt="Pulalend app badge" width={340} height={170} className="rounded-xl" />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-6 bg-white/85 hero-surface rounded-2xl px-5 py-4 float-delay">
                <div className="text-xs uppercase tracking-wide text-navy-deep/60">Approval speed</div>
                <div className="font-display text-2xl text-navy-deep">48 hrs</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <section className="bg-deep-band text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
            <div className="space-y-6 fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs uppercase tracking-wide">
                How to get your funds
              </div>
              <h2 className="font-display text-3xl md:text-4xl">A fast track from application to funding.</h2>
              <p className="text-white/75">
                We verify borrower profiles fast so lenders can commit quickly. Three guided steps keep everything clear.
              </p>
              <Link
                href="/register?type=borrower"
                className="inline-flex px-6 py-3 bg-white text-navy-deep rounded-full hover:bg-slate-100 transition"
              >
                Start Application
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4 stagger">
              {[
                {
                  step: "1",
                  title: "Get Approved",
                  items: ["Create a secure account", "Submit your application", "Wait 4-5 minutes for review"],
                },
                {
                  step: "2",
                  title: "Choose Your Product",
                  items: ["Pick your funding amount", "Review and sign terms", "Connect your bank securely"],
                },
                {
                  step: "3",
                  title: "Get Funded",
                  items: ["Upload closing documents", "Confirm with your loan expert", "Receive funds fast"],
                },
              ].map((card) => (
                <div key={card.step} className="rounded-2xl p-6 bg-white/10 border border-white/15">
                  <div className="text-4xl font-display text-white/70">{card.step}</div>
                  <div className="font-display text-lg mt-2">{card.title}</div>
                  <ul className="text-sm text-white/75 mt-3 space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-accent-orange">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="font-display text-3xl text-navy-deep">Lending and borrowing power new possibilities.</div>
            <p className="text-navy-deep/70">
              A rising tide lifts all boats. Use Pulalend to accelerate the next chapter for lending and borrowing.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "Borrower Growth",
                "Debt Consolidation",
                "Inventory Purchase",
                "Invoice Fulfillment",
                "Working Capital",
                "Equipment Purchase",
                "Payroll Processing",
                "Unexpected Bills",
              ].map((item) => (
                <span key={item} className="px-4 py-2 rounded-full accent-chip text-sm text-navy-deep">
                  {item}
                </span>
              ))}
            </div>
            <Link
              href="/register?type=borrower"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-[#F28C28] to-[#F6B24B] text-white rounded-full hover:from-[#e07a18] hover:to-[#F28C28] transition"
            >
              See Lending & Borrowing Options
            </Link>
          </div>
          <div className="hero-surface rounded-3xl p-6 surface-tint-blue">
            <div className="text-sm text-navy-deep/60">Live lending/borrowing dashboard</div>
            <div className="font-display text-2xl text-navy-deep">Borrowing momentum</div>
            <div className="mt-6 space-y-4">
              {[
                { label: "Retail expansion", value: "P2.2k", pct: "64%" },
                { label: "Manufacturing run", value: "P4.8k", pct: "82%" },
                { label: "Construction payroll", value: "P3.1k", pct: "58%" },
              ].map((item) => (
                <div key={item.label} className="bg-white/90 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm text-navy-deep/70">
                    <span>{item.label}</span>
                    <span className="font-semibold text-navy-deep">{item.value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-navy-deep/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1E73D8] to-[#38A34A]" style={{ width: item.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="font-display text-3xl text-navy-deep">Relationships matter.</div>
            <p className="text-navy-deep/70">
              Here is why borrowers and lenders return. Trust, transparency, and fast execution.
            </p>
            <Link
              href="/register"
              className="inline-flex px-6 py-3 bg-gradient-to-r from-[#1E73D8] to-[#38A34A] text-white rounded-full hover:from-[#0B2242] hover:to-[#1E73D8] transition"
            >
              Join Pulalend
            </Link>
          </div>
          <div className="grid gap-4">
            {[
              "The Pulalend team delivered funding when we were under pressure.",
              "Our lender matched us fast and kept terms transparent.",
              "We made payroll on time because approvals were immediate.",
            ].map((quote) => (
              <div key={quote} className="bg-white/90 hero-surface rounded-2xl p-5 surface-tint-orange">
                <div className="text-sm text-navy-deep/80">“{quote}”</div>
                <div className="text-xs text-navy-deep/60 mt-3">Pulalend Customer</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-cta-band text-white p-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div className="space-y-5">
              <div className="text-sm uppercase tracking-widest text-white/70">Apply now</div>
              <div className="font-display text-3xl md:text-4xl">Get approved in minutes.</div>
              <p className="text-white/75">
                Join borrowers and lenders already growing with Pulalend. It only takes a few minutes to start.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register?type=borrower"
                  className="px-6 py-3 bg-white text-navy-deep rounded-full hover:bg-slate-100 transition"
                >
                  Apply for Funding
                </Link>
                <Link
                  href="/register?type=lender"
                  className="px-6 py-3 border border-white/40 rounded-full text-white hover:bg-white/10 transition"
                >
                  Become a Lender
                </Link>
              </div>
            </div>
            <div className="hero-surface rounded-3xl p-6 surface-tint-orange text-navy-deep">
              <div className="text-sm text-navy-deep/60">Stay in the know</div>
              <div className="font-display text-2xl">Weekly funding intel</div>
              <p className="text-sm text-navy-deep/70 mt-2">
                Get new deals, repayment insights, and approval tips.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 px-4 py-2 rounded-full border border-navy-deep/20 focus:outline-none focus:ring-2 focus:ring-primary-blue/40"
                  placeholder="Email address"
                />
                <button className="px-5 py-2 bg-navy-deep text-white rounded-full hover:bg-primary-blue transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-navy-deep/10 bg-white/85 surface-tint-blue">
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
