import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#f5f5f7] dark:bg-black text-center selection:bg-blue-100">
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <p className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Beta Release</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            Physics, <br />
            <span className="text-gray-500">Reimagined.</span>
          </h1>
        </div>

        <p className="text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
          Interactive simulations powered by real physics and AI.
          Experience intuition over equations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-12 text-left">
          <SimCard
            title="Projectile Motion"
            desc="Launch objects, adjust angles, and destroy targets in this classic mechanics lab."
            href="/sim/projectile"
            color="bg-blue-500"
          />
          <SimCard
            title="Charged Particles"
            desc="Explore electromagnetic fields and watch particles dance in the Lorentz force."
            href="/sim/charged-particle"
            color="bg-red-500"
          />
          <SimCard
            title="Double Slit"
            desc="Visualize wave interference and the quantum nature of light in real-time."
            href="/sim/double-slit"
            color="bg-purple-500"
          />
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl w-full">
        <FeatureCard
          title="Interactive"
          desc="Manipulate variables in real-time. See the immediate impact on physical systems."
        />
        <FeatureCard
          title="Visual"
          desc="High-fidelity rendering brings abstract concepts to life with stunning clarity."
        />
        <FeatureCard
          title="Intelligent"
          desc="AI-powered explanations guide your discovery. Ask 'Why?' and get visual answers."
        />
      </div>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 leading-snug">{desc}</p>
    </div>
  );
}

function SimCard({ title, desc, href, color }: { title: string, desc: string, href: string, color: string }) {
  return (
    <div className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-2 ${color}`}></div>
      <div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">{desc}</p>
      </div>
      <Link
        href={href}
        className="inline-flex items-center font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors"
      >
        Launch Simulation <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
