import {
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	type CollectedInteraction,
	InteractionCollector,
	MessageFlags,
	type RGBTuple,
	SeparatorSpacingSize,
} from 'discord.js';
import { ExtendedContainerBuilder } from './extendedContainer';

type DeepRequired<T> = T extends Function ? T : T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : T;

interface ConfirmationPromptButton {
	label?: string;
	callback?: (
		baseInteraction: ChatInputCommandInteraction,
		interaction: CollectedInteraction,
		placeholders: {
			title: string;
			description: string;
		}
	) => Promise<any> | any;
	placeholders?: {
		title?: string;
		description?: string;
	};
}

interface ConfirmationPromptOptions {
	interaction: ChatInputCommandInteraction;
	color?: number | RGBTuple;
	prompt?: ExtendedContainerBuilder;
	title?: string;
	description?: string;
	options: {
		ok: ConfirmationPromptButton;
		cancel?: ConfirmationPromptButton;
	};
	timeout?: {
		time?: number;
		placeholders?: {
			title?: string;
			description?: string;
		};
		callback?: (
			baseInteraction: ChatInputCommandInteraction,
			placeholders: {
				title: string;
				description: string;
			}
		) => Promise<any> | any;
	};
}

class ConfirmationPrompt {
	private interaction: ChatInputCommandInteraction;
	private prompt: ExtendedContainerBuilder | undefined;
	private title: string | undefined;
	private description: string | undefined;
	private color?: number | RGBTuple;

	private timeout = {
		time: 300_000, // invalidate after 5 mins
		placeholders: {
			title: 'Action Timeout',
			description: `This prompt has timed out, please retry the steps you took to get back to the original prompt, or just leave this prompt if you intended for it to time out.`,
		},
		callback: async (
			interaction: ChatInputCommandInteraction,
			{
				title,
				description,
			}: {
				title: string;
				description: string;
			}
		) =>
			await interaction.editReply({
				flags: [MessageFlags.IsComponentsV2],
				components: [this.createSimpleComponent(title, description)],
			}),
	};

	private option_ok: DeepRequired<ConfirmationPromptButton> = {
		label: 'OK',
		placeholders: {
			title: 'Confirmed Action',
			description: 'The action behind this prompt was confirmed, but there was no callback to handle it.',
		},
		callback: async (_, interaction, { title, description }) =>
			await interaction.editReply({
				flags: [MessageFlags.IsComponentsV2],
				components: [this.createSimpleComponent(title, description)],
			}),
	};

	private option_cancel: DeepRequired<ConfirmationPromptButton> = {
		label: 'Cancel',
		placeholders: {
			title: 'Denied Action',
			description:
				'Action voided, you can navigate back to this prompt by following the original process to how you got here if you mistakenly chose to cancel this prompt.',
		},
		callback: async (interaction, _, { title, description }) =>
			await interaction.editReply({
				flags: [MessageFlags.IsComponentsV2],
				components: [this.createSimpleComponent(title, description)],
			}),
	};

	constructor(options: ConfirmationPromptOptions) {
		// Set required
		this.interaction = options.interaction;

		// Set optionals
		this.color = options.color;
		this.prompt = options.prompt;
		this.title = options.title;
		this.description = options.description;

		// Merge timeout options with defaults
		if (options.timeout) {
			if (options.timeout.time !== undefined) this.timeout.time = options.timeout.time;
			if (options.timeout.callback !== undefined) this.timeout.callback = options.timeout.callback;
		}

		// Merge OK button options with defaults
		if (options.options.ok.label !== undefined) this.option_ok.label = options.options.ok.label;
		if (options.options.ok.callback !== undefined) this.option_ok.callback = options.options.ok.callback;
		if (options.options.ok.placeholders) {
			if (options.options.ok.placeholders.title !== undefined)
				this.option_ok.placeholders.title = options.options.ok.placeholders.title;
			if (options.options.ok.placeholders.description !== undefined)
				this.option_ok.placeholders.description = options.options.ok.placeholders.description;
		}

		// Merge Cancel button options with defaults
		if (options.options.cancel) {
			if (options.options.cancel.label !== undefined) this.option_cancel.label = options.options.cancel.label;
			if (options.options.cancel.callback !== undefined)
				this.option_cancel.callback = options.options.cancel.callback;
			if (options.options.cancel.placeholders) {
				if (options.options.cancel.placeholders.title !== undefined)
					this.option_cancel.placeholders.title = options.options.cancel.placeholders.title;
				if (options.options.cancel.placeholders.description !== undefined)
					this.option_cancel.placeholders.description = options.options.cancel.placeholders.description;
			}
		}
	}

	private createSimpleComponent = (title: string, description: string) =>
		new ExtendedContainerBuilder()
			.setAccentColor(this.color)
			.addTextDisplayComponents((str) => str.setContent(`## ${title}`))
			.addSeparatorComponents((s) => s.setDivider(true))
			.addTextDisplayComponents((str) => str.setContent(description));

	public async respond(timeout: number = this.timeout.time) {
		const prompt = new ExtendedContainerBuilder().setAccentColor(this.color);

		if (this.title) prompt.addTextDisplayComponents((t) => t.setContent(`## ${this.title!}`));
		if (this.description) prompt.addTextDisplayComponents((t) => t.setContent(this.description!));
		if (this.title || this.description) prompt.addSeparatorComponents((s) => s.setDivider(true));
		if (this.prompt) prompt.addSnapInContainer(this.prompt).addSeparatorComponents((s) => s.setDivider(true));

		prompt
			.addActionRowComponents((r) =>
				r.addComponents(
					new ButtonBuilder()
						.setCustomId(`button:prompts:cancel:${this.interaction.id}`)
						.setStyle(ButtonStyle.Secondary)
						.setLabel(this.option_cancel.label),
					new ButtonBuilder()
						.setCustomId(`button:prompts:ok:${this.interaction.id}`)
						.setStyle(ButtonStyle.Primary)
						.setLabel(this.option_ok.label)
				)
			)
			.addSeparatorComponents((s) => s.setDivider(false).setSpacing(SeparatorSpacingSize.Small))
			.addTextDisplayComponents((t) =>
				t.setContent('-# You have 5 minutes to interact with this prompt before it times out.')
			);

		await this.interaction.editReply({
			components: [prompt],
			flags: [MessageFlags.IsComponentsV2],
		});

		const message = await this.interaction.fetchReply();

		const collector = new InteractionCollector(this.interaction.client, {
			time: timeout,
			message,
			filter: (i) => {
				if (i.user.id !== this.interaction.user.id) return false;

				const allowedIds = [
					`button:prompts:cancel:${this.interaction.id}`,
					`button:prompts:ok:${this.interaction.id}`,
				];
				// Check if the customId matches exactly or starts with any of the allowed IDs
				const matchesCustomId = allowedIds.some((allowedId) => i.customId === allowedId);
				return matchesCustomId;
			},
		});

		let handledInteraction: boolean = false;

		collector.on('collect', async (i) => {
			if (handledInteraction) return;
			handledInteraction = true;
			collector.stop('handled');

			return i.customId === `button:prompts:cancel:${this.interaction.id}`
				? await this.option_cancel.callback(this.interaction, i, this.option_cancel.placeholders)
				: await this.option_ok.callback(this.interaction, i, this.option_ok.placeholders);
		});

		collector.on('end', async (_, reason) => {
			if (handledInteraction) return;
			if (reason !== 'time') return;

			return await this.timeout.callback(this.interaction, this.timeout.placeholders);
		});
	}
}

export { ConfirmationPrompt };
