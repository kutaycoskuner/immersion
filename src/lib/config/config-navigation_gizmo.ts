export const ViewportGizmoOptions = {
	type: 'sphere',
	size: 128,
	placement: 'bottom-right',
	resolution: 64,
	lineWidth: 6,
	radius: 1,
	smoothness: 18,
	animated: true,
	speed: 1,
	background: {
		enabled: true,
		color: 16777215,
		opacity: 0,
		hover: {
			color: 16777215,
			opacity: 0.2
		}
	},
	font: {
		family: 'sans-serif',
		weight: 800
	},
	offset: {
		top: 10,
		left: 10,
		bottom: 10,
		right: 10
	},
	corners: {
		enabled: true,
		color: 16766208,
		opacity: 1,
		scale: 0.15,
		radius: 1,
		smoothness: 18,
		hover: {
			color: 16777215,
			opacity: 1,
			scale: 0.2
		}
	},
	edges: {
		enabled: false,
		color: 16766208,
		opacity: 0.5,
		radius: 1,
		smoothness: 18,
		scale: 0.15,
		hover: {
			color: 16777215,
			opacity: 1,
			scale: 0.2
		}
	},
	x: {
		enabled: true,
		color: 16725587,
		opacity: 1,
		scale: 0.7,
		labelColor: 2236962,
		line: true,
		border: {
			size: 0,
			color: 14540253
		},
		hover: {
			color: 16777215,
			labelColor: 2236962,
			opacity: 1,
			scale: 0.7,
			border: {
				size: 0,
				color: 14540253
			}
		},
		label: 'X'
	},
	y: {
		enabled: true,
		color: 9100032,
		opacity: 1,
		scale: 0.7,
		labelColor: 2236962,
		line: true,
		border: {
			size: 0,
			color: 14540253
		},
		hover: {
			color: 16777215,
			labelColor: 2236962,
			opacity: 1,
			scale: 0.7,
			border: {
				size: 0,
				color: 14540253
			}
		},
		label: 'Y'
	},
	z: {
		enabled: true,
		color: 2920447,
		opacity: 1,
		scale: 0.7,
		labelColor: 2236962,
		line: true,
		border: {
			size: 0,
			color: 14540253
		},
		hover: {
			color: 16777215,
			labelColor: 2236962,
			opacity: 1,
			scale: 0.7,
			border: {
				size: 0,
				color: 14540253
			}
		},
		label: 'Z'
	},
	nx: {
		line: false,
		scale: 0.45,
		hover: {
			scale: 0.5,
			color: 16777215,
			labelColor: 2236962,
			opacity: 1,
			border: {
				size: 0,
				color: 14540253
			}
		},
		label: '',
		enabled: true,
		color: 16725587,
		opacity: 1,
		labelColor: 2236962,
		border: {
			size: 0,
			color: 14540253
		}
	},
	ny: {
		line: false,
		scale: 0.45,
		hover: {
			scale: 0.5,
			color: 16777215,
			labelColor: 2236962,
			opacity: 1,
			border: {
				size: 0,
				color: 14540253
			}
		},
		label: '',
		enabled: true,
		color: 9100032,
		opacity: 1,
		labelColor: 2236962,
		border: {
			size: 0,
			color: 14540253
		}
	},
	nz: {
		line: false,
		scale: 0.45,
		hover: {
			scale: 0.5,
			color: 16777215,
			labelColor: 2236962,
			opacity: 1,
			border: {
				size: 0,
				color: 14540253
			}
		},
		label: '',
		enabled: true,
		color: 2920447,
		opacity: 1,
		labelColor: 2236962,
		border: {
			size: 0,
			color: 14540253
		}
	},
	isSphere: true
};
