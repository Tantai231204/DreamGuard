import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { processSteps } from "../../data";

export default function ProcessSteps() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-primary mb-2">
            How It Works
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl mx-auto">
            From booking to doorstep delivery — sit back while we take care of everything.
          </p>
        </div>

        {/* Process Card - matching home page LaundryProcess style */}
        <div className="bg-white border border-dashed border-blue-300 rounded-lg p-5 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Image Side */}
            <div className="relative">
              <AspectRatio.Root ratio={4 / 3}>
                <div className="rounded-lg overflow-hidden bg-gray-100 w-full h-full">
                  <img
                    src="https://i.pinimg.com/736x/a3/e5/b4/a3e5b4880c313bcef61e90af755c4208.jpg"
                    alt="Professional Cleaning Process"
                    className="w-full h-full object-cover"
                  />
                </div>
              </AspectRatio.Root>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 bg-[var(--color-primary-light)] text-gray-900 text-xs font-medium rounded-full hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Book Now
              </button>
            </div>

            {/* Process Steps */}
            <div>
              <h3 className="text-base font-semibold text-primary mb-3">
                Professional Cleaning Process
              </h3>
              <ul className="space-y-3">
                {processSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.step}
                      className="flex items-start gap-3 text-xs text-gray-700"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-primary border border-blue-200">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{step.title}</span>
                        <p className="text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
