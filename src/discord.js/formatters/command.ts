export function command(command: { name: string; id: string }) {
	return `</${command.name}:${command.id}>`;
}
