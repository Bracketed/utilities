import os from 'node:os';

export function getOS(): string | undefined {
	switch (os.platform()) {
		case 'win32':
			return 'windows';
		case 'darwin':
			return 'mac';
		case 'linux':
			return 'linux';
		default:
			return undefined;
	}
}

export function isValidArchitecture(architecture: string): boolean {
	architecture = architecture.toLocaleLowerCase();

	switch (architecture) {
		case 'arm':
			return true;
		case 'arm64':
			return true;
		case 'ia32':
			return true;
		case 'x64':
			return true;

		default:
			return false;
	}
}
