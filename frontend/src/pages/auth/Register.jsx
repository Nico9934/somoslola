import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { text, alerts, inputs } from '../../styles';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await register(email, password);
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Contenedor principal con grid */}
            <div className="w-full grid lg:grid-cols-2">
                {/* Columna izquierda - Formulario */}
                <div className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 bg-white">
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        {/* Logo */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">SOMOSLOLA</h1>
                        </div>

                        {/* Título */}
                        <div className="mb-8">
                            <p className={text.caption}>Start your journey</p>
                            <h2 className="text-3xl font-bold text-gray-900 mt-2">Crear Cuenta</h2>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className={`block ${text.label} mb-2`}>E-mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="example@gmail.com"
                                    className={inputs.text}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className={`block ${text.label} mb-2`}>Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className={inputs.text}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className={`block ${text.label} mb-2`}>Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className={inputs.text}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <p className={alerts.errorText}>{error}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </button>
                        </form>

                        {/* Link a login */}
                        <p className={`mt-8 text-center ${text.body}`}>
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Columna derecha - Imagen (oculta en mobile) */}
                <div className="hidden lg:block relative bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
                    <img
                        src="/hero-login.png"
                        alt="Register Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
}
