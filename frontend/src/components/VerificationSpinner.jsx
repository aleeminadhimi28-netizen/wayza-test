export default function VerificationSpinner({ fullScreen = true }) {
  return (
    <div
      className={
        fullScreen
          ? 'min-h-screen w-full flex items-center justify-center dash-transition'
          : 'py-12 w-full flex items-center justify-center'
      }
      style={{ background: fullScreen ? 'var(--dash-bg)' : 'transparent' }}
    >
      <div
        className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: 'var(--dash-divider)', borderTopColor: 'var(--dash-accent-500)' }}
      />
    </div>
  );
}
