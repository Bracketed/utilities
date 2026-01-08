import { zodEvaluate } from 'src/misc/evaluate';
import { z } from 'zod';

export function bulletpoint(content: string): string {
	if (!zodEvaluate(z.string(), content))
		throw new TypeError('Argument error: Bulletpoint text is not of the correct type: string');
	return `- ${content}`;
}
