import { ComponentType, ContainerBuilder } from 'discord.js';

/**
 * A builder that creates API-compatible JSON data for a container.
 *
 * Extended to allow the merging of other components via the `addSnapInContainer()` function.
 */
export class ExtendedContainerBuilder extends ContainerBuilder {
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
