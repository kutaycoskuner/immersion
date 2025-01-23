<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
	import { modelStore } from '../../store/model_store';

	let overlayVisible: boolean = false;
	let mainSelectionName: string = '';

	function handleFileUpload(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const files = Array.from(input.files);
			const fileMap = new Map(files.map((file) => [file.name, file]));

			// Find the main .gltf file
			const gltfFile = files.find((file) => file.name.endsWith('.gltf'));
			if (!gltfFile) {
				console.error('No .gltf file found in the uploaded files.');
				return;
			}

			const fileLoader = new THREE.FileLoader();
			fileLoader.load(
				URL.createObjectURL(gltfFile),
				(gltfContent) => {
					// Ensure gltfContent is a string
					let gltfContentString: string;
					if (gltfContent instanceof ArrayBuffer) {
						const decoder = new TextDecoder('utf-8');
						gltfContentString = decoder.decode(gltfContent);
					} else {
						gltfContentString = gltfContent as string;
					}

					const json = JSON.parse(gltfContentString);

					// Update relative paths to use the uploaded files
					const basePath = gltfFile.name.replace(/[^/]+$/, '');
					if (json.buffers) {
						json.buffers.forEach((buffer: any) => {
							const bufferFile = fileMap.get(basePath + buffer.uri);
							if (bufferFile) {
								buffer.uri = URL.createObjectURL(bufferFile);
							}
						});
					}
					if (json.images) {
						json.images.forEach((image: any) => {
							const imageFile = fileMap.get(basePath + image.uri);
							if (imageFile) {
								image.uri = URL.createObjectURL(imageFile);
							}
						});
					}

					// Load the GLTF model using updated URLs
					const loader = new GLTFLoader();
					loader.parse(
						JSON.stringify(json),
						'',
						(gltf) => {
							console.log('GLTF model loaded:', gltf);
							modelStore.set(gltf.scene);
						},
						(error) => {
							console.error('Error parsing GLTF model:', error);
						}
					);
				},
				undefined,
				(error) => {
					console.error('Error loading GLTF file:', error);
				}
			);
		}
		toggleOverlay(false);
	}

	function setMenu(param1: boolean, param2: boolean, selection: string): void {
		mainSelectionName = selection;
	}

	function toggleOverlay(visible?: boolean): void {
		overlayVisible = visible !== undefined ? visible : !overlayVisible;
		document.body.style.overflow = overlayVisible ? 'hidden' : '';
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			toggleOverlay();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<link rel="stylesheet" href="styles/settings_overlay.css" />

<!-- Overlay -->
{#if overlayVisible}
	<div class="overlay">
		<button class="overlay-close" on:click={() => toggleOverlay(false)}>
			<span class="overlay-close-text">Close</span> <span class="overlay-close-icon">&times;</span>
		</button>

		<div class="overlay-content">
			<div class="overlay-menu">
				<button
					class={mainSelectionName === 'upload' ? 'selected' : 'selected'}
					on:click={() => setMenu(true, true, 'upload')}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="21"
						height="21"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3" />
					</svg>
					<span>upload</span>
				</button>
			</div>
			<div class="overlay-submenu">
				<div>
					<label class="custom-file-upload">
						<input class="default-input" type="file" multiple on:change={handleFileUpload} />
						Upload your GLTF model and related files
					</label>
				</div>
			</div>
		</div>
	</div>
{/if}
