import { zodEvaluate } from 'src/misc/evaluate';
import * as z from 'zod';

export enum HeaderType {
	Big = 1,
	Medium = 2,
	Small = 3,
}

const tests = {
	headerType: z.union([z.enum(HeaderType), z.number().min(1).max(3)]),
	string: z.string(),
};

export const h = (string: string, type: HeaderType | number): string => {
	if (!zodEvaluate(tests.string, string))
		throw new TypeError('Argument error: Header text is not of the correct type: string');
	if (!zodEvaluate(tests.headerType, type))
		throw new TypeError(
			'Argument error: Header type is not of the correct type: HeaderType (enum) or Number, or exceeds the boundaries from between 1 and 3.'
		);

	return `${'#'.repeat(type)} ${string}`;
};

function parseMultiStringHeader(strings: string[], type: HeaderType): string {
	if (zodEvaluate(z.array(z.string()), strings)) return h(strings.join(' '), type);
	throw new TypeError('Argument error: Header text is not of the correct type: string (or string array)');
}

export const h1 = (...strings: string[]): string => parseMultiStringHeader(strings, HeaderType.Big);
export const h2 = (...strings: string[]): string => parseMultiStringHeader(strings, HeaderType.Medium);
export const h3 = (...strings: string[]): string => parseMultiStringHeader(strings, HeaderType.Small);
