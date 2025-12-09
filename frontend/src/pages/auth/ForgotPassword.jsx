import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { text } from '../../styles/patterns/text';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setSuccess(true);

            // Redirigir a la página de reset password con el email
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al enviar código de recuperación');
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
                            <FaEnvelope className="text-white text-2xl" />
                        </div>
                        <h1 className={`${text.h2} mb-2`}>¿Olvidaste tu contraseña?</h1>
                        <p className={text.muted}>
                            Ingresá tu email y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
                        </p>
                    </div>

                    {success ? (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                            <p className="text-green-700 text-sm">
                                ✅ Código enviado exitosamente a <strong>{email}</strong>
                            </p>
                            <p className="text-green-600 text-xs mt-2">
                                Redirigiendo...
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

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? 'Enviando...' : 'Enviar código'}
                            </Button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
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

export default ForgotPassword;
