import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

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
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-primary mb-6 text-center">
                    SOMOSLOLA
                </h1>
                <h2 className="text-xl text-muted mb-6 text-center">Iniciar Sesión</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="tu@email.com"
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </form>

                {/* 🔧 DEV: Botones de login rápido */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">🔧 Testing - Login Rápido:</p>

                    {/* Admin */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Admin:</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEmail('admin@somoslola.com');
                                setPassword('admin123');
                            }}
                            className="w-full"
                        >
                            👤 Admin
                        </Button>
                    </div>

                    {/* Clientes de prueba */}
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Clientes de prueba:</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEmail('prueba1@gmail.com');
                                    setPassword('prueba1');
                                }}
                            >
                                👥 Prueba 1
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEmail('prueba2@gmail.com');
                                    setPassword('prueba2');
                                }}
                            >
                                👥 Prueba 2
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEmail('prueba3@gmail.com');
                                    setPassword('prueba3');
                                }}
                            >
                                👥 Prueba 3
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setEmail('prueba4@gmail.com');
                                    setPassword('prueba4');
                                }}
                            >
                                👥 Prueba 4
                            </Button>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2 italic">
                        Click en un botón y luego "Ingresar" (o Enter)
                    </p>
                </div>

                <p className="mt-6 text-center text-sm text-muted">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-secondary hover:underline">
                        Regístrate
                    </Link>
                </p>
            </Card>
        </div>
    );
}
