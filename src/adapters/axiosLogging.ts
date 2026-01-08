import axios from 'axios';
import chalk from 'chalk';

axios.interceptors.request.use(
	(config) => {
		console.info(
			`Axios: --> ${chalk.green(`[${config.method?.toUpperCase()}]`)} ${config.url} \nAxios: --> ${chalk.green(`[${config.method?.toUpperCase()}]`)} Body:`,
			config.data ? config.data : {}
		);
		return config;
	},
	(error) => Promise.reject(error)
);

axios.interceptors.response.use(
	(response) => {
		console.info(
			`Axios: <-- ${chalk.green(`[${response.config.method?.toUpperCase()}]`)} ${chalk.yellow(response.status)} ${response.config.url} \nAxios: <-- ${chalk.green(`[${response.config.method?.toUpperCase()}]`)} Body:`,
			response.data ? response.data : {}
		);
		return response;
	},
	(error) => {
		if (error.response)
			console.info(
				`Axios: <-- ${chalk.green(`[${error.config?.method?.toUpperCase()}]`)} ${chalk.yellow(error.response.status)} ${error.config?.url} \nAxios: <-- ${chalk.green(`[${error.config?.method?.toUpperCase()}]`)} Body:`,
				error.response.data ? error.response.data : {}
			);

		return Promise.reject(error);
	}
);

export default axios;
