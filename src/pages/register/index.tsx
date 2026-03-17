import Link from 'next/link';
import Router from 'next/router';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormControl from 'react-bootstrap/FormControl';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import ApplicationHead from '../../components/ApplicationHead';
import ErrorToastContainer from '../../components/ErrorToastContainer';
import useAuthentication from '../../hooks/useAuthentication';
import useToast from '../../hooks/useToast';
import homeStyles from '../../styles/modules/Home.module.scss';
import api from '../../utils/api';

export default function Register() {
	const [loading, setLoading] = useState(true);
	const [toasts, addToast] = useToast();

	useAuthentication((player) => {
		if (player) {
			if (player.admin) return Router.push('/admin/main');
			return Router.push('/sheet/player/1');
		} else setLoading(false);
	});

	async function onFormSubmit(
		username: string,
		password: string,
		confirmPassword: string
	) {
		setLoading(true);

		try {
			if (username.length === 0 || password.length === 0 || confirmPassword.length === 0)
				throw new Error('Todos os campos devem ser preenchidos.');
			if (password !== confirmPassword) throw new Error('As senhas não coincidem.');
			await api.post('/register', { username, password });
			Router.push('/sheet/player/1');
		} catch (err) {
			addToast(err);
			setLoading(false);
		}
	}

	if (loading)
		return (
			<Container className='text-center d-flex align-items-center justify-content-center' style={{ height: '100vh' }}>
				<Spinner animation='border' style={{ color: '#8a2be2' }} />
			</Container>
		);

	return (
		<>
			<ApplicationHead title='Cadastro de Jogador' />
			<Container className='d-flex align-items-center justify-content-center' style={{ minHeight: '80vh', marginTop: '2rem', marginBottom: '2rem' }}>
				<div
					style={{
						backgroundColor: '#150d22',
						padding: '40px',
						borderRadius: '15px',
						border: '1px solid #3b2259',
						boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.7)',
						width: '100%',
						maxWidth: '450px',
					}}
				>
					<Row className='text-center mb-4'>
						<Col>
							<h1 style={{ color: '#c4a7e7', fontWeight: 'bold', textShadow: '0 0 10px rgba(138, 43, 226, 0.3)' }}>
								<label htmlFor='username'>Novo Jogador</label>
							</h1>
						</Col>
					</Row>
					
					<RegisterForm onSubmit={onFormSubmit} />
					
					<Row className='text-center mt-4'>
						<Col>
							<div className='mb-2'>
								<span className='me-2' style={{ color: '#9d8db3' }}>Já possui cadastro?</span>
								<Link href='/' passHref>
									<a className={homeStyles.link} style={{ color: '#b175ff', fontWeight: 'bold' }}>Entrar</a>
								</Link>
							</div>
							<div>
								<span className='me-2' style={{ color: '#5c4d75', fontSize: '0.85rem' }}>É o mestre?</span>
								<Link href='/register/admin' passHref>
									<a className={homeStyles.link} style={{ color: '#8a2be2', fontSize: '0.85rem' }}>Cadastrar-se como mestre</a>
								</Link>
							</div>
						</Col>
					</Row>
				</div>
			</Container>
			<ErrorToastContainer toasts={toasts} />
		</>
	);
}

function RegisterForm(props: {
	onSubmit: (username: string, password: string, confirmPassword: string) => void;
}) {
	const [username, setUsername] = useState('');
	const[password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	return (
		<form
			onSubmit={(ev) => {
				ev.preventDefault();
				setPassword('');
				setConfirmPassword('');
				props.onSubmit(username, password, confirmPassword);
			}}>
			<Row className='mb-3 justify-content-center'>
				<Col>
					<FormControl
						className='text-center theme-element'
						placeholder='Nome de Usuário'
						id='username'
						name='username'
						value={username}
						onChange={(e) => setUsername(e.currentTarget.value)}
						style={{
							backgroundColor: '#0b0710',
							borderColor: '#3b2259',
							color: '#fff',
							padding: '12px',
							borderRadius: '8px'
						}}
					/>
				</Col>
			</Row>
			<Row className='mb-3 justify-content-center'>
				<Col>
					<FormControl
						type='password'
						className='text-center theme-element'
						placeholder='Senha'
						id='password'
						name='password'
						value={password}
						onChange={(e) => setPassword(e.currentTarget.value)}
						style={{
							backgroundColor: '#0b0710',
							borderColor: '#3b2259',
							color: '#fff',
							padding: '12px',
							borderRadius: '8px'
						}}
					/>
				</Col>
			</Row>
			<Row className='mb-4 justify-content-center'>
				<Col>
					<FormControl
						type='password'
						className='text-center theme-element'
						placeholder='Confirmar Senha'
						id='confirmPassword'
						name='confirmPassword'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.currentTarget.value)}
						style={{
							backgroundColor: '#0b0710',
							borderColor: '#3b2259',
							color: '#fff',
							padding: '12px',
							borderRadius: '8px'
						}}
					/>
				</Col>
			</Row>
			<Row className='justify-content-center'>
				<Col>
					<Button 
						type='submit' 
						className='w-100'
						style={{
							backgroundColor: '#8a2be2',
							borderColor: '#8a2be2',
							fontWeight: 'bold',
							padding: '10px',
							borderRadius: '8px',
							boxShadow: '0 4px 15px rgba(138, 43, 226, 0.4)'
						}}
					>
						CRIAR CONTA
					</Button>
				</Col>
			</Row>
		</form>
	);
}