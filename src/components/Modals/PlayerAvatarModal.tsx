import type { ChangeEvent } from 'react';
import { useCallback, useContext, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import FormLabel from 'react-bootstrap/FormLabel';
import Row from 'react-bootstrap/Row';
import { useDropzone } from 'react-dropzone';
import { ErrorLogger } from '../../contexts';
import api from '../../utils/api';
import SheetModal from './SheetModal';

type AvatarData = {
	id: number | null;
	link: string | null;
	name: string;
};

type PlayerAvatarModalProps = {
	playerAvatars: {
		link: string | null;
		AttributeStatus: {
			id: number;
			name: string;
		} | null;
	}[];
	show?: boolean;
	onHide?: () => void;
	onUpdate?: () => void;
	npcId?: number;
};

export default function PlayerAvatarModal(props: PlayerAvatarModalProps) {
	const [avatars, setAvatars] = useState<AvatarData[]>(
		props.playerAvatars.map((avatar) => {
			if (avatar.AttributeStatus)
				return {
					id: avatar.AttributeStatus.id,
					name: avatar.AttributeStatus.name,
					link: avatar.link,
				};
			else
				return {
					id: null,
					name: 'Padrão',
					link: avatar.link,
				};
		})
	);
	const [loading, setLoading] = useState(false);
	const logError = useContext(ErrorLogger);

	// Lógica para converter arquivo para Base64
	const onDrop = useCallback((acceptedFiles: File[], id: number | null) => {
		const file = acceptedFiles[0];
		if (!file) return;
		
		const reader = new FileReader();
		reader.onload = () => {
			setAvatars((prev) =>
				prev.map((a) => (a.id === id ? { ...a, link: reader.result as string } : a))
			);
		};
		reader.readAsDataURL(file);
	}, []);

	function onUpdateAvatar() {
		setLoading(true);
		api
			.post('/sheet/player/avatar', { avatarData: avatars, npcId: props.npcId })
			.then(props.onUpdate)
			.catch(logError)
			.finally(() => {
				setLoading(false);
				props.onHide?.();
			});
	}

	return (
		<SheetModal
			title='Editar Avatar'
			applyButton={{ name: 'Atualizar', onApply: onUpdateAvatar, disabled: loading }}
			show={props.show}
			onHide={props.onHide}
			scrollable>
			<Container fluid>
				<Row className='mb-3 h4 text-center'>
					<Col>
						Arraste uma imagem ou clique para selecionar. <b>PNG recomendado</b>.
					</Col>
				</Row>
				{avatars.map((avatar) => (
					<AvatarDropzone 
						key={avatar.id ?? 'default'} 
						avatar={avatar} 
						onDrop={onDrop} 
					/>
				))}
			</Container>
		</SheetModal>
	);
}

// Componente auxiliar para o Dropzone
function AvatarDropzone({ avatar, onDrop }: { avatar: AvatarData; onDrop: (files: File[], id: number | null) => void }) {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: (files) => onDrop(files, avatar.id),
		accept: { 'image/*': [] },
		multiple: false
	});

	return (
		<div className='mb-4'>
			<FormLabel>Avatar ({avatar.name})</FormLabel>
			<div
				{...getRootProps()}
				style={{
					border: isDragActive ? '2px dashed #0d6efd' : '2px dashed #444',
					padding: '15px',
					textAlign: 'center',
					cursor: 'pointer',
					borderRadius: '10px',
					backgroundColor: '#212529'
				}}>
				<input {...getInputProps()} />
				{avatar.link ? (
					<img
						src={avatar.link}
						alt={avatar.name}
						style={{
							width: '100px',
							height: '100px',
							borderRadius: '50%',
							objectFit: 'cover',
							border: '2px solid #fff'
						}}
					/>
				) : (
					<div style={{ padding: '20px', color: '#aaa' }}>
						Clique ou arraste aqui
					</div>
				)}
			</div>
		</div>
	);
}