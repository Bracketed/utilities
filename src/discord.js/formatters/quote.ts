import { zodEvaluate } from 'src/misc/evaluate';
import { z } from 'zod';

export function inlineQuote(content: string) {
	if (!zodEvaluate(z.string(), content))
		throw new TypeError('Argument error: Inline Quote text is not of the correct type: string');
	return `> ${content}`;
}

export function blockQuote(content: string) {
	if (!zodEvaluate(z.string(), content))
		throw new TypeError('Argument error: Block Quote text is not of the correct type: string');
	return `>>> ${content}`;
}
