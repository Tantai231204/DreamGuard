import { processSteps } from "../../data";
import SectionHeader from "./SectionHeader";
import StepCard from "./StepCard";

export default function ProcessSteps() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="How It Works"
          title="Simple 4-Step Process"
          description="From booking to doorstep delivery — sit back while we take care of everything."
        />

        {/* Desktop Timeline */}
        <div className="relative hidden md:block">
          {/* Connector Line */}
          <div className="absolute top-14 left-[12%] right-[12%] h-1 rounded-full bg-gradient-to-r from-[#bde8f5] via-[#4988c4] to-[#bde8f5]" />

          <div className="grid md:grid-cols-4 gap-8 relative">
            {processSteps.map((step, index) => (
              <StepCard
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                icon={step.icon}
                index={index}
                variant="vertical"
              />
            ))}
          </div>
        </div>

        {/* Mobile List */}
        <div className="md:hidden space-y-4">
          {processSteps.map((step, index) => (
            <StepCard
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
              index={index}
              variant="horizontal"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
