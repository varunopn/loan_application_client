// ============================================
// Stepper Component - Multi-step wizard UI
// ============================================

interface Step {
  label: string;
  completed: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div style={containerStyle}>
      {steps.map((step, index) => (
        <div key={index} style={stepContainerStyle}>
          <div style={stepStyle}>
            <div
              style={{
                ...stepCircleStyle,
                ...(index < currentStep ? completedStyle : {}),
                ...(index === currentStep ? activeStyle : {}),
              }}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            <div
              style={{
                ...stepLabelStyle,
                ...(index === currentStep ? activeLabelStyle : {}),
              }}
            >
              {step.label}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              style={{
                ...lineStyle,
                ...(index < currentStep ? completedLineStyle : {}),
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '2rem',
};

const stepContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  flex: 1,
};

const stepStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
};

const stepCircleStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#e5e7eb',
  color: '#6b7280',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1rem',
  marginBottom: '0.5rem',
};

const completedStyle: React.CSSProperties = {
  backgroundColor: '#10b981',
  color: 'white',
};

const activeStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: 'white',
};

const stepLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: '#6b7280',
  textAlign: 'center',
};

const activeLabelStyle: React.CSSProperties = {
  color: '#2563eb',
  fontWeight: '600',
};

const lineStyle: React.CSSProperties = {
  height: '2px',
  backgroundColor: '#e5e7eb',
  flex: 1,
  marginTop: '20px',
};

const completedLineStyle: React.CSSProperties = {
  backgroundColor: '#10b981',
};
