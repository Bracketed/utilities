import { zodEvaluate } from 'src/misc/evaluate';
import { z } from 'zod';
import { bulletpoint } from './bulletpoint';

enum ListStyle {
	Numerical = 1,
	Bulletpoints = 2,
}

type ListItem = (string | [string, ListItem])[];
type ListOptions = {
	style?: ListStyle | number;
};

const listSchema = z.array(z.union([z.string(), z.tuple([z.string(), z.lazy(() => listSchema)])]));
const optionsSchema = z.optional(
	z.object({
		style: z.optional(z.union([z.enum(ListStyle), z.number().min(1).max(2)])).default(ListStyle.Bulletpoints),
	})
);

export function list(items: ListItem, options?: ListOptions, depth: number = 0): string {
	if (!zodEvaluate(listSchema, items)) throw new TypeError('Argument error: List items are not of the correct type');
	if (!zodEvaluate(optionsSchema, options))
		throw new TypeError(
			'Argument error: Options are incorrect, please make sure the style is using the correct enum or numbers.'
		);

	const style = options.style ?? ListStyle.Bulletpoints;

	return items
		.map((item, index) => {
			const indent = '  '.repeat(depth);
			if (typeof item === 'string')
				return indent + (style === ListStyle.Bulletpoints ? bulletpoint(item) : `${index}. ${item}`);

			const [text, children] = item;
			const lines = [indent + (style === ListStyle.Bulletpoints ? bulletpoint(text) : `${index}. ${text}`)];

			if (children && children.length > 0) lines.push(list(children, options, depth + 1));
			return lines.join('\n');
		})
		.join('\n');
}
