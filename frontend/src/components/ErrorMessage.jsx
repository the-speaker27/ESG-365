export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <p>{message || "Unable to load this information. Please try again."}</p>
      {onRetry && (
        <button className="button button-secondary" onClick={onRetry} type="button">
          Try again
        </button>
      )}
    </div>
  );
}