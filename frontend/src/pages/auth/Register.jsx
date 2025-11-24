import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

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
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-primary mb-6 text-center">
                    SOMOSLOLA
                </h1>
                <h2 className="text-xl text-muted mb-6 text-center">Crear Cuenta</h2>

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

                    <Input
                        label="Confirmar Contraseña"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-secondary hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </Card>
        </div>
    );
}
