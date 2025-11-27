import { inputs, alerts } from '../../styles';

export default function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className={inputs.group}>
            {label && (
                <label className={inputs.label}>
                    {label}
                </label>
            )}
            <input
                className={`${error ? inputs.error : inputs.text} ${className}`}
                {...props}
            />
            {error && (
                <div className="mt-1">
                    <p className={alerts.errorText}>{error}</p>
                </div>
            )}
        </div>
    );
}
