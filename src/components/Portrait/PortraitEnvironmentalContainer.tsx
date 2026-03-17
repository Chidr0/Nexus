import { Fragment, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Fade from 'react-bootstrap/Fade';
import Draggable from 'react-draggable';
import type { SocketIO } from '../../hooks/useSocket';
import styles from '../../styles/modules/Portrait.module.scss';
import { clamp } from '../../utils';
import type { Environment } from '../../utils/config';
import { getAttributeStyle } from '../../utils/style';
import type { PortraitEnvironmentOrientation } from '../Modals/GetPortraitModal';

type PortraitPlayerName = { name: string; show: boolean };

type PortraitAttributes = {
	value: number;
	Attribute: {
		id: number;
		name: string;
		color: string;
	};
	maxValue: number;
	show: boolean;
}[];

const bounds = {
	top: 0,
	bottom: 450,
	left: 0,
	right: 0,
};

export default function PortraitEnvironmentalContainer(props: {
	socket: SocketIO;
	environment: Environment;
	attributes: PortraitAttributes;
	playerName: PortraitPlayerName;
	playerId: number;
	debug: boolean;
	nameOrientation: PortraitEnvironmentOrientation;
}) {
	const [environment, setEnvironment] = useState(props.environment);
	const[diceColor, setDiceColor] = useState('000000'); // Cor padrão caso não tenha no link

	// Captura a cor do link e muda o fundo da página inteira
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const color = params.get('dicecolor');
		if (color) {
			setDiceColor(color);
			// Pinta o fundo do navegador/OBS com a cor escolhida
			document.body.style.backgroundColor = `#${color}`;
			document.body.style.backgroundImage = 'none'; // Remove qualquer fundo escuro do tema
		}
	},[]);

	useEffect(() => {
		props.socket.on('environmentChange', (newValue) =>
			setEnvironment(newValue as Environment)
		);

		return () => {
			props.socket.off('environmentChange');
		};
	}, [props.socket]);

	let divStyle: CSSProperties = { width: 800 };

	props.nameOrientation === 'Direita'
		? (divStyle = { ...divStyle, left: 430, textAlign: 'start' })
		: (divStyle = { ...divStyle, left: 0, textAlign: 'end' });

	return (
		<div className={styles.container} style={divStyle}>
			<PortraitAttributesContainer
				environment={environment}
				attributes={props.attributes}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
			/>
			<PortraitNameContainer
				environment={environment}
				playerName={props.playerName}
				playerId={props.playerId}
				socket={props.socket}
				debug={props.debug}
				diceColor={diceColor}
			/>
		</div>
	);
}

function PortraitAttributesContainer(props: {
	socket: SocketIO;
	environment: Environment;
	attributes: PortraitAttributes;
	playerId: number;
	debug: boolean;
}) {
	const [attributes, setAttributes] = useState(props.attributes);
	const [positionY, setPositionY] = useState(0);

	useEffect(() => {
		setPositionY(Number(localStorage.getItem('attribute-pos-y') || 300));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	useEffect(() => {
		props.socket.on(
			'playerAttributeChange',
			(playerId, attributeId, value, maxValue, show) => {
				if (playerId !== props.playerId) return;

				setAttributes((attributes) => {
					const index = attributes.findIndex((attr) => attr.Attribute.id === attributeId);
					if (index === -1) return attributes;

					const newAttributes = [...attributes];

					newAttributes[index].value = value;
					newAttributes[index].maxValue = maxValue;
					newAttributes[index].show = show;

					return newAttributes;
				});
			}
		);

		return () => {
			props.socket.off('playerAttributeChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.socket]);

	return (
		<Draggable
			axis='y'
			position={{ x: 0, y: positionY }}
			bounds={bounds}
			onStop={(_ev, data) => {
				const posY = clamp(data.y, bounds.top, bounds.bottom);
				setPositionY(posY);
				localStorage.setItem('attribute-pos-y', posY.toString());
			}}>
			<Fade in={props.debug || props.environment === 'combat'}>
				<div className={styles.combat}>
					{attributes.map((attr) => (
						<Fragment key={attr.Attribute.id}>
							<span
								className={`${styles.attribute} atributo-primario ${attr.Attribute.name}`}
								style={getAttributeStyle(attr.Attribute.color)}>
								<label>{attr.show ? `${attr.value}/${attr.maxValue}` : '?/?'}</label>
							</span>
							<br />
						</Fragment>
					))}
				</div>
			</Fade>
		</Draggable>
	);
}

function PortraitNameContainer(props: {
	socket: SocketIO;
	environment: Environment;
	playerName: PortraitPlayerName;
	playerId: number;
	debug: boolean;
	diceColor: string;
}) {
	const [playerName, setPlayerName] = useState(props.playerName);
	const [positionY, setPositionY] = useState(0);

	useEffect(() => {
		setPositionY(Number(localStorage.getItem('name-pos-y') || 300));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[]);

	useEffect(() => {
		props.socket.on('playerNameChange', (playerId, name) => {
			if (playerId !== props.playerId) return;
			setPlayerName((pn) => ({ ...pn, name }));
		});

		props.socket.on('playerNameShowChange', (playerId, show) => {
			if (playerId !== props.playerId) return;
			setPlayerName((pn) => ({ ...pn, show }));
		});

		return () => {
			props.socket.off('playerNameChange');
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	},[props.socket]);

	return (
		<Draggable
			axis='y'
			position={{ x: 0, y: positionY }}
			bounds={bounds}
			onStop={(_ev, data) => {
				const posY = clamp(data.y, bounds.top, bounds.bottom);
				setPositionY(posY);
				localStorage.setItem('name-pos-y', posY.toString());
			}}>
			<Fade in={props.debug || props.environment === 'idle'}>
				<div className={styles.nameContainer}>
					<label 
						className={`${styles.name} nome`}
						style={{
							display: 'inline-block',
							// A MÁGICA DA IMAGEM: Rotação subindo levemente
							transform: 'rotate(-8deg)', 
							color: 'white',
							// Sombra que imita um "contorno" escuro (igual da sua imagem)
							textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0px 0px 15px rgba(0,0,0,0.5)',
							textAlign: 'center', // Para o primeiro nome ficar em cima do segundo centralizado
							lineHeight: '1.1' // Junta as linhas para não ficar um buraco entre o nome e o sobrenome
						}}
					>
						{playerName.show ? playerName.name || 'Desconhecido' : '???'}
					</label>
				</div>
			</Fade>
		</Draggable>
	);
}