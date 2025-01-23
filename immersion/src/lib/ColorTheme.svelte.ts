import { writable } from 'svelte/store';
import { browser } from '$app/environment';

class Theme {
	private _theme = writable(browser && localStorage.getItem('color-scheme') || 'light');

	get current() {
		let value;
		this._theme.subscribe(v => value = v)();
		return value;
	}

	get themeStore() {
		return this._theme; 
	}

	toggle = () => {
		const theme = this.current === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('color-scheme', theme);
		if (browser) localStorage.setItem('color-scheme', theme);
		this._theme.set(theme); // Update the store
	};
}

export const theme = new Theme();
