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
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-600">🔧 Desarrollo - Login Rápido:</p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEmail('admin@somoslola.com');
                                setPassword('admin123');
                            }}
                            className="flex-1"
                        >
                            👤 Admin
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEmail('prueba1@gmail.com');
                                setPassword('prueba1');
                            }}
                            className="flex-1"
                        >
                            👥 Customer
                        </Button>
                    </div>
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
