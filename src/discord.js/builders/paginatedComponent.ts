import {
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
	type ActionRowBuilder,
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type MessageActionRowComponentBuilder,
	type RGBTuple,
} from 'discord.js';
import { ExtendedContainerBuilder } from './extendedContainer';

export interface PaginateMessageOptions {
	/** Optional title displayed at the top */
	title?: string;
	/** Optional description displayed below the title */
	description?: string;
	/** The interaction to respond to */
	interaction: ChatInputCommandInteraction;
	/** Array of ExtendedContainerBuilder content for each page */
	pages: Array<ExtendedContainerBuilder>;
	/** Timeout in milliseconds (default: 5 minutes) */
	timeout?: number;

	color?: number | RGBTuple;
}

export class PaginateMessage {
	private readonly title?: string;
	private readonly description?: string;
	private readonly interaction: ChatInputCommandInteraction;
	private readonly pages: Array<ExtendedContainerBuilder>;
	private readonly timeout: number;
	private readonly customIdPrefix: string;
	private readonly color?: number | RGBTuple;

	private currentPage = 0;

	public constructor(options: PaginateMessageOptions) {
		this.title = options.title;
		this.description = options.description;
		this.interaction = options.interaction;
		this.pages = options.pages;
		this.timeout = options.timeout ?? 5 * 60 * 1000; // 5 minutes default
		this.customIdPrefix = `paginate:${this.interaction.id}`;
		this.color = options.color;
	}

	public closedContainer = new ExtendedContainerBuilder()
		.setAccentColor(this.color)
		.addTextDisplayComponents((text) => text.setContent('## Interaction Cancelled/Closed'))
		.addSeparatorComponents((sep) => sep.setDivider(true))
		.addTextDisplayComponents((text) => text.setContent('This pagination session has been closed/cancelled.'));

	public async run(): Promise<void> {
		if (this.pages.length === 0) {
			await this.interaction.editReply({
				content: 'No pages to display.',
			});
			return;
		}

		const message = await this.interaction.editReply({
			components: [this.buildContainer()],
			flags: [MessageFlags.IsComponentsV2],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: this.timeout,
			filter: (i) => i.customId.startsWith(this.customIdPrefix) && i.user.id === this.interaction.user.id,
		});

		collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
			const action = buttonInteraction.customId.replace(`${this.customIdPrefix}:`, '');

			switch (action) {
				case 'first':
					this.currentPage = 0;
					break;
				case 'last':
					this.currentPage = this.pages.length - 1;
					break;
				case 'cancel':
					collector.stop('cancelled');
					await buttonInteraction.update({
						components: [this.closedContainer],
					});
					return;
				default:
					// Handle numbered page buttons
					if (action.startsWith('page:')) {
						const pageNum = Number.parseInt(action.replace('page:', ''), 10);
						if (!Number.isNaN(pageNum) && pageNum >= 0 && pageNum < this.pages.length)
							this.currentPage = pageNum;
					}
					break;
			}

			await buttonInteraction.update({
				components: [this.buildContainer()],
			});
		});

		collector.on('end', async (_, reason) => {
			if (reason === 'cancelled') return;
			try {
				await this.interaction.editReply({
					components: [this.buildContainer(true)],
				});
			} catch {}
		});
	}

	private buildButtonRow(
		row: ActionRowBuilder<MessageActionRowComponentBuilder>,
		disabled = false
	): ActionRowBuilder<MessageActionRowComponentBuilder> {
		row.addComponents(
			new ButtonBuilder() // First Page button
				.setCustomId(`${this.customIdPrefix}:first`)
				.setLabel('First')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabled || this.currentPage === 0),
			...this.getPageNumberWindow().map((pageNum) =>
				new ButtonBuilder() // Page numbers
					.setCustomId(`${this.customIdPrefix}:page:${pageNum}`)
					.setLabel(String(pageNum + 1))
					.setStyle(pageNum === this.currentPage ? ButtonStyle.Primary : ButtonStyle.Secondary)
					.setDisabled(disabled || pageNum === this.currentPage)
			),
			new ButtonBuilder() // Last Page button
				.setCustomId(`${this.customIdPrefix}:last`)
				.setLabel('Last')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(disabled || this.currentPage === this.pages.length - 1),
			new ButtonBuilder() // Cancel/Close button
				.setCustomId(`${this.customIdPrefix}:cancel`)
				.setLabel('Close')
				.setStyle(ButtonStyle.Danger)
				.setDisabled(disabled)
		);

		return row;
	}

	private getPageNumberWindow(): Array<number> {
		if (this.pages.length <= 3) return Array.from({ length: this.pages.length }, (_, i) => i);

		let start = this.currentPage - 1;
		let end = this.currentPage + 1;

		if (start < 0) {
			start = 0;
			end = 2;
		}

		if (end >= this.pages.length) {
			end = this.pages.length - 1;
			start = this.pages.length - 3;
		}

		return [start, start + 1, start + 2];
	}

	private buildContainer(disabled = false): ExtendedContainerBuilder {
		const newContainer = new ExtendedContainerBuilder().setAccentColor(this.color);

		if (this.title) newContainer.addTextDisplayComponents((text) => text.setContent(`## ${this.title}`));
		if (this.description)
			newContainer
				.addSeparatorComponents((sep) => sep.setDivider(true))
				.addTextDisplayComponents((text) => text.setContent(this.description!));

		if (this.title || this.description) newContainer.addSeparatorComponents((sep) => sep.setDivider(true));

		newContainer
			.addSnapInContainer(this.pages[this.currentPage]) // merges current page into the container
			.addSeparatorComponents((sep) => sep.setDivider(true))
			.addTextDisplayComponents((text) => text.setContent(`Page ${this.currentPage + 1} of ${this.pages.length}`))
			.addActionRowComponents((r) => this.buildButtonRow(r, disabled));

		return newContainer;
	}
}
