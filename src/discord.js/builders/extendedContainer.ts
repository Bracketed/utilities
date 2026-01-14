import { ComponentType, ContainerBuilder, SeparatorSpacingSize, subtext } from 'discord.js';

/**
 * A builder that creates API-compatible JSON data for a container.
 *
 * Extended to allow the merging of other components via the `addSnapInContainer()` function.
 */
export class ExtendedContainerBuilder extends ContainerBuilder {
	/**
	 * Add text to the container builder, this is a quick preconfigured alias of `addTextDisplayComponents`, where every string ends with a line break.
	 * @param strings The strings to add into the container.
	 * @returns This builder for chaining
	 */
	addText(...strings: string[]): this {
		this.addTextDisplayComponents((str) => str.setContent(strings.join('\n')));
		return this;
	}
	/**
	 * Adds a timestamp footer, similar to Discord embed footers.
	 * @param spacing The spacing size, default is small.
	 * @param visibleDivider If the divider should be visible, default is false.
	 * @returns This builder for chaining
	 */
	addTimestamp(opt?: Partial<{ spacing: SeparatorSpacingSize; visibleDivider: boolean; date: Date }>): this {
		const formatted = new Intl.DateTimeFormat('en-GB', {
			weekday: 'long',
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}).format(opt?.date ?? new Date());

		this.addSeparatorComponents((sep) =>
			sep.setSpacing(opt?.spacing ?? SeparatorSpacingSize.Small).setDivider(opt?.visibleDivider ?? false)
		).addTextDisplayComponents((str) => str.setContent(subtext(formatted)));

		return this;
	}

	/**
	 * Merges another ContainerBuilder into this one
	 * @param other The ContainerBuilder to merge
	 * @returns This builder for chaining
	 */
	addSnapInContainer(other: ContainerBuilder | ExtendedContainerBuilder): this {
		const otherData = other.toJSON();

		if (otherData.components)
			for (const component of otherData.components)
				switch (component.type) {
					case ComponentType.ActionRow:
						this.addActionRowComponents(component as any);
						break;
					case ComponentType.TextDisplay:
						this.addTextDisplayComponents(() => component as any);
						break;
					case ComponentType.Section:
						this.addSectionComponents(() => component as any);
						break;
					case ComponentType.Separator:
						this.addSeparatorComponents(() => component as any);
						break;
					case ComponentType.MediaGallery:
						this.addMediaGalleryComponents(() => component as any);
						break;
					case ComponentType.File:
						this.addFileComponents(() => component as any);
						break;
					default:
						throw new TypeError(`Unknown component type: ${(component as any).type}`);
				}

		return this;
	}
}
