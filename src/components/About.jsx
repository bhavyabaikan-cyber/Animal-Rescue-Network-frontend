import { pageWrapper, articleGrid, articleCardClass, articleTitle } from "../styles/common";

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] py-20">
        <div className={`${pageWrapper} text-center`}>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1d1d1f] mb-6">About RescueNet</h1>
          <p className="text-lg text-[#6e6e73] max-w-3xl mx-auto">
            Born from a simple belief: that every animal in distress deserves a coordinated, compassionate response.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-white">
        <div className={`${pageWrapper} grid md:grid-cols-2 gap-12 items-center`}>
          <div className="bg-[#f5f5f7] rounded-3xl h-80 flex items-center justify-center text-6xl">🏥🐾</div>
          <div>
            <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">Our Story</h2>
            <p className="text-[#6e6e73] mb-4">
              RescueNet began in 2023 when a group of animal lovers realized that well-meaning citizens often didn't know how to help injured strays. Reports went unanswered, volunteers were hard to find, and donors couldn't see the impact of their contributions.
            </p>
            <p className="text-[#6e6e73] mb-4">
              Today, we connect over 850 verified volunteers across 15 Indian cities, coordinate 200+ rescues monthly, and ensure every rupee donated goes directly to vet care, transport, and rehabilitation.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="text-center"><div className="text-3xl font-bold text-[#0066cc]">2023</div><div className="text-sm text-[#6e6e73]">Founded</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-[#0066cc]">15+</div><div className="text-sm text-[#6e6e73]">Cities</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-[#0066cc]">2.5K+</div><div className="text-sm text-[#6e6e73]">Rescues</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className={pageWrapper}>
          <h2 className="text-3xl font-bold text-[#1d1d1f] text-center mb-12">Our Core Values</h2>
          <div className={articleGrid}>
            {[
              { icon: "🔍", title: "Transparency", desc: "Every donation, every rescue, every outcome—fully visible to our community." },
              { icon: "🤝", title: "Collaboration", desc: "Citizens, volunteers, vets, and donors working as one coordinated network." },
              { icon: "❤️", title: "Compassion First", desc: "Animal welfare guides every decision, policy, and feature we build." },
              { icon: "🚀", title: "Innovation", desc: "Leveraging technology to solve real-world rescue coordination challenges." }
            ].map((v, i) => (
              <div key={i} className={articleCardClass}>
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className={articleTitle}>{v.title}</h3>
                <p className="text-sm text-[#6e6e73]">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}