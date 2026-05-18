import { Check } from 'lucide-react';

interface StepperStep {
  label: string;
  status: 'complete' | 'active' | 'inactive';
}

interface NexusStepperProps {
  steps: StepperStep[];
}

export function NexusStepper({ steps }: NexusStepperProps) {
  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute top-6 right-0 left-0 h-0.5 bg-stepper-connector -z-10" />

        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-2 relative">
            {/* Step circle */}
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all
                ${step.status === 'complete'
                  ? 'bg-stepper-complete text-white shadow-md'
                  : step.status === 'active'
                  ? 'bg-stepper-active text-white shadow-lg shadow-primary/30'
                  : 'bg-card border-2 border-stepper-inactive text-muted-foreground'
                }
              `}
            >
              {step.status === 'complete' ? (
                <Check className="w-6 h-6" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>

            {/* Step label */}
            <span
              className={`
                text-sm font-medium text-center max-w-[100px]
                ${step.status === 'active' ? 'text-foreground' : 'text-muted-foreground'}
              `}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
