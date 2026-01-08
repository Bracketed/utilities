export default function keygen() {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890#@';
	const availableSpecialCharacters = '_.';
	const availableLength = 128;

	let result = '';
	let underscoreUsed = false;
	let dotUsed = false;

	for (let i = 0; i < availableLength; i++) {
		let randomChar: string;

		if (!underscoreUsed && i >= availableLength / 3 && i <= (2 * availableLength) / 3 && Math.random() < 0.8) {
			randomChar = '_';
			underscoreUsed = true;
		} else if (!dotUsed && i >= availableLength - Math.floor(Math.random() * 4 + 30)) {
			randomChar = '.';
			dotUsed = true;
		} else {
			const filteredCharacters = characters + availableSpecialCharacters.replace('_', '').replace('.', '');
			const randomIndex = Math.floor(Math.random() * filteredCharacters.length);
			randomChar = filteredCharacters.charAt(randomIndex);
		}
		result += randomChar;
	}

	return result;
}
