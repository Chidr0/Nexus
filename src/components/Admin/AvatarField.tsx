import { useEffect, useRef, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image'; // Mantive o import original
import api from '../../utils/api';

type AvatarFieldProps = {
	status: { id: number; value: boolean }[];
	playerId: number;
};

export default function AvatarField({ status, playerId }: AvatarFieldProps) {
	const [src, setSrc] = useState('#');
	const previousStatusID = useRef(Number.MAX_SAFE_INTEGER);

	useEffect(() => {
		let statusID = 0;
		for (const stat of status) {
			if (stat.value) {
				statusID = stat.id;
				break;
			}
		}
		
		if (statusID === previousStatusID.current) return;
		previousStatusID.current = statusID;
		
		api
			.get(`/sheet/player/avatar/${statusID}?playerID=${playerId}`)
			.then((res) => setSrc(res.data.link || '/avatar404.png'))
			.catch(() => setSrc('/avatar404.png'));
	}, [status, playerId]);

	return (
		<Col>
			<div style={{ 
				width: '250px', 
				height: '250px', 
				margin: '0 auto', 
				overflow: 'hidden', 
				borderRadius: '50%', // Forma circular
				border: '3px solid #444' // Moldura opcional
			}}>
				<img
					src={src}
					alt='Avatar'
					onError={() => setSrc('/avatar404.png')}
					style={{ 
						width: '100%', 
						height: '100%', 
						objectFit: 'cover' // Isso impede que a imagem fique esticada/feia
					}}
				/>
			</div>
		</Col>
	);
}