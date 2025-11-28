import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { text, alerts, inputs } from '../../styles';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/products');
            }
        } catch (err) {
            setError('Credenciales inválidas');
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
                    <div className="w-full max-w-md mx-auto">
                        {/* Logo */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">SOMOSLOLA</h1>
                        </div>

                        {/* Título */}
                        <div className="mb-8">
                            <p className={text.caption}>Start your journey</p>
                            <h2 className="text-3xl font-bold text-gray-900 mt-2">Iniciar Sesión</h2>
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
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </form>

                        {/* 🔧 DEV: Botones de login rápido */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className={`${text.caption} mb-3`}>🔧 TESTING - LOGIN RÁPIDO:</p>

                            {/* Admin */}
                            <div className="mb-3">
                                <p className={`${text.caption} mb-2`}>Admin:</p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmail('admin@somoslola.com');
                                        setPassword('admin123');
                                    }}
                                    className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    👤 Admin
                                </button>
                            </div>

                            {/* Clientes de prueba */}
                            <div>
                                <p className={`${text.caption} mb-2`}>Clientes de prueba:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail('prueba1@test.com');
                                            setPassword('prueba1');
                                        }}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                                    >
                                        👥 Prueba 1
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail('prueba2@test.com');
                                            setPassword('prueba2');
                                        }}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                                    >
                                        👥 Prueba 2
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail('prueba3@test.com');
                                            setPassword('prueba3');
                                        }}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                                    >
                                        👥 Prueba 3
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmail('prueba4@test.com');
                                            setPassword('prueba4');
                                        }}
                                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                                    >
                                        👥 Prueba 4
                                    </button>
                                </div>
                            </div>
                            <p className={`${text.caption} mt-2 italic`}>
                                Click en un botón y luego "Ingresar"
                            </p>
                        </div>

                        {/* Link a registro */}
                        <p className={`mt-8 text-center ${text.body}`}>
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Regístrate
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Columna derecha - Imagen (oculta en mobile) */}
                <div className="hidden lg:block relative bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
                    <img
                        src="/hero-login.png"
                        alt="Login Hero"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    );
}
