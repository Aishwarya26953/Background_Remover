import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Uploading image" },
  { id: 2, label: "Preparing image" },
  { id: 3, label: "Removing background" },
];

const STEP_DELAYS = [0, 900, 1800];

export default function ProcessingView({ originalPreview }) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timers = [];

    STEP_DELAYS.forEach((delay, index) => {
      const t = setTimeout(() => {
        setCurrentStep(index + 1);
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Thumbnail */}
        {originalPreview && (
          <div className="mb-8 flex justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
              <img
                src={originalPreview}
                alt="Uploaded image"
                className="h-full w-full object-cover"
              />
              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-pulse bg-white/20" />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isDone = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;

            return (
              <div
                key={step.id}
                className={[
                  "flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-300",
                  isActive
                    ? "bg-white shadow-sm border border-slate-200"
                    : isDone
                    ? "opacity-60"
                    : "opacity-30",
                ].join(" ")}
              >
                {/* Icon */}
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2
                      size={20}
                      className="text-emerald-500"
                      strokeWidth={2}
                    />
                  ) : isActive ? (
                    <Loader2
                      size={20}
                      className="animate-spin text-blue-600"
                      strokeWidth={2}
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={[
                    "text-sm font-medium",
                    isActive
                      ? "text-slate-900"
                      : isDone
                      ? "text-slate-500"
                      : "text-slate-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          This usually takes a few seconds
        </p>
      </div>
    </div>
  );
}
