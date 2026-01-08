import { inspect } from 'node:util';
import { zodEvaluate } from 'src/misc/evaluate';
import { z } from 'zod';

export function inlineCode(content: string) {
	if (!zodEvaluate(z.string(), content))
		throw new TypeError('Argument error: Inline Code text is not of the correct type: string');
	return `\`${content}\``;
}

export { codeBlock as code };
export function codeBlock(content: unknown, language?: string, depth: number = 2) {
	const code = typeof content === 'string' ? content : inspect(content, { colors: false, depth });

	if (!zodEvaluate(z.string(), code))
		throw new TypeError('Argument error: Code block Code/object could not be transformed into text.');
	if (!zodEvaluate(z.optional(z.string()), language))
		throw new TypeError('Argument error: Code block Language is not a string but was defined.');

	return `\`\`\`${language ? `${language}` : ''}\n${code}\n\`\`\``;
}
