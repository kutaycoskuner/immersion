<script lang="ts">
	let toggleNavigation = false;
	let prevScrollpos = 0;
	let invertedColor = false;

	// Set the initial inverted color based on the system color mode
	// import { browser } from '$app/env';
	// if (browser) {
	//   invertedColor = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	// }

	// Handle navigation toggle
	const toggleLeft = () => {
		toggleNavigation = !toggleNavigation;
	};

	const openLeft = () => {
		toggleNavigation = true;
	};

	const closeLeft = () => {
		toggleNavigation = false;
	};

	const scrollToTop = () => {
		window.scrollTo(0, 0);
	};
</script>



<div class="navigation-container0 hover-control touch-control" class:open={toggleNavigation}>
	<div class="fixed-nav-icon hover-trans-invisible" class:closed={!toggleNavigation} class:inverted-color={invertedColor}>
		<img alt="menu-grid" src="icons/menu-grid_256.png" />
	</div>

	<nav class="navigation hover-trans-visible touch-leftslide" class:open={toggleNavigation}>
		<div><a href="/"> architecture </a></div>
		<div><a href="/visualization"> visualization </a></div>
		<div><a href="/port/computer_science"> computer science </a></div>
		<div><a href="/port/game_design"> game design </a></div>
		<div><a href="/content_tree"> blog </a></div>
		<div><a href="/about"> about </a></div>
		<div class="touch-only" class:open={toggleNavigation}>
			<img class:inverted-color={invertedColor} src="/icons/arrow-left_256.png" alt="arrow" />
		</div>
	</nav>
</div>

<style scoped>
	.navigation-container0 {
		user-select: none;
		font-family: var(--main-font);
		font-weight: bold;
		text-decoration: bold;
		text-transform: uppercase;
		font-size: 0.9em;
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		max-width: 1920px;
		width: 100%;
		height: 0;
		display: grid;
		grid-template-rows: repeat(1, 1fr);
		grid-template-columns: auto 1fr;
		white-space: nowrap;
		z-index: 20;
	}

	.fixed-nav-icon {
		position: fixed;
		margin: 0;
		padding: 0;
		top: var(--navigation-margin-top);
		left: var(--navigation-margin-left);
		z-index: 90;
	}

	.fixed-nav-icon img {
		opacity: 0.8;
		width: 1.2rem;
	}

	.navigation {
		letter-spacing: 2px;
		margin-top: var(--navigation-margin-top);
		margin-left: var(--navigation-margin-left);
		display: grid;
		grid-template-rows: repeat(1, 1fr);
		align-self: flex-start;
	}

	.navigation a {
		text-decoration: none;
		display: inline-block;
		position: relative;
		transition: color 0.2s ease;
		margin-bottom: 0.3em;
		opacity: 0.7;
		color: var(--col);
		z-index: 90;
	}

	.navigation a:hover {
		opacity: 0.2;
		color: var(--col);
	}

	@media (max-width: 1024px) {
		.navigation-container0.open {
			width: 40%;
			left: 20%;
		}

		.navigation {
			letter-spacing: 0.4rem;
			margin-left: 1em;
			margin-top: 1em;
			font-size: 0.9rem;
			visibility: hidden;
			transition: opacity 0.2s;
		}

		.navigation.open {
			visibility: visible;
		}

		.touch-only {
			opacity: 0;
		}

		.touch-only.open {
			margin-top: 1em;
			opacity: 1;
		}

		.touch-only img {
			max-width: 100%;
			opacity: 0.7;
		}
	}

	@media (max-width: 480px) {
		.navigation-container0.open {
			width: 60%;
			left: 30%;
		}

		.navigation {
			letter-spacing: 1px;
			margin-left: 1em;
			margin-top: 1em;
			font-size: 0.9rem;
			visibility: hidden;
			transition: opacity 0.2s;
		}

		.navigation.open {
			visibility: visible;
		}

		.touch-only {
			opacity: 0;
		}

		.touch-only.open {
			margin-top: 1em;
			opacity: 1;
		}

		.touch-only img {
			max-width: 100%;
			opacity: 0.7;
		}
	}
</style>
