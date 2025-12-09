import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { text } from '../../styles/patterns/text';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || '';

    const [email, setEmail] = useState(emailFromState);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (token.length !== 6) {
            setError('El código debe tener 6 dígitos');
            return;
        }

        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_URL}/auth/reset-password`, {
                email,
                token,
                newPassword
            });

            setSuccess(true);

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al restablecer contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <Card className="p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-none mb-4">
                            {success ? (
                                <FaCheckCircle className="text-white text-2xl" />
                            ) : (
                                <FaLock className="text-white text-2xl" />
                            )}
                        </div>
                        <h1 className={`${text.h2} mb-2`}>
                            {success ? '¡Contraseña Actualizada!' : 'Restablecer Contraseña'}
                        </h1>
                        <p className={text.muted}>
                            {success
                                ? 'Tu contraseña ha sido actualizada correctamente.'
                                : 'Ingresá el código de 6 dígitos que recibiste por email y tu nueva contraseña.'
                            }
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                            <p className="text-green-700 text-sm text-center">
                                ✅ Redirigiendo al login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                    <p className="text-red-700 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className={`block mb-2 ${text.label}`}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 ${text.label}`}>
                                    Código de 6 dígitos
                                </label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="123456"
                                    maxLength="6"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-none text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-1 focus:ring-black"
                                />
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    El código expira en 15 minutos
                                </p>
                            </div>

                            <div>
                                <label className={`block mb-2 ${text.label}`}>
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength="6"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-black"
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 ${text.label}`}>
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repetí tu contraseña"
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-none focus:outline-none focus:ring-1 focus:ring-black"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? 'Actualizando...' : 'Restablecer contraseña'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 space-y-2 text-center">
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="text-sm text-gray-600 hover:text-black block mx-auto"
                        >
                            ¿No recibiste el código? Solicitar uno nuevo
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-600 hover:text-black flex items-center justify-center gap-2 mx-auto"
                        >
                            <FaArrowLeft size={12} />
                            Volver al login
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
