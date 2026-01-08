import { zodEvaluate } from 'src/misc/evaluate';
import * as z from 'zod';

export const subtext = (...strings: string[]): string => {
	if (!zodEvaluate(z.array(z.string()), strings))
		throw new TypeError('Argument error: Subtext text is not of the correct type: string');

	return `-# ${strings.join(' ')}`;
};
