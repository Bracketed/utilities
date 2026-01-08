import { zodEvaluate } from 'src/misc/evaluate';
import * as z from 'zod';

export { hyperlink as anchor }; // Alias
export const hyperlink = (string: string, href: string): string => {
	if (!zodEvaluate(z.string(), string))
		throw new TypeError('Argument error: Hyperlink text is not of the correct type: string');
	if (!zodEvaluate(z.httpUrl(), href))
		throw new TypeError('Argument error: Hyperlink href is not of the correct type: string (http url)');
	return `[${string}](${href})`;
};

export const link = (href: string): string => {
	if (!zodEvaluate(z.httpUrl(), href))
		throw new TypeError('Argument error: Link href is not of the correct type: string (http url)');
	return `<${href}>`;
};
