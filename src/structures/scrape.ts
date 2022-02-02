import puppeteer from "puppeteer";
import { logger } from "../config/pino.js";
import { EventEmitter } from "events";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday.js";
import fetch from "node-fetch";
import fs from "fs/promises";
import { cronitor } from "../index.js"


dayjs.extend(weekday);

export class TokenGrabber extends EventEmitter {
	public token: string | boolean;
	public browser: puppeteer.Browser | undefined;
	public page: puppeteer.Page | undefined;
	private monitor = new cronitor.Monitor("Get API Token");
	public constructor() {
		super();
		this.token = "";
		this.getToken();
	}

	public async getAssignments(retries = 5): Promise<any> {
		try {
			return await this.requestAssignments();
		} catch (err) {
			logger.error("Failed to get assignments, grabbing token again and retrying...");

			if (retries > 0) {
				await this.getToken();
				await this.getAssignments(retries - 1);
			} else {
				logger.error("All attempts failed");
				process.exit(1);
			}
		}
	}

	public async getMissing(retries = 5): Promise<any> {
		try {
			return await this.requestMissing();
		} catch (err) {
			logger.error("Failed to get missing assignments, grabbing token again and retrying...");

			if (retries > 0) {
				await this.getToken();
				await this.getMissing(retries - 1);
			} else {
				logger.fatal("All attempts failed");
				process.exit(1);
			}
		}
	}

	public requestAssignments(): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const url = await this.generateUrl();
				const response = await fetch(url);
				const json: any = await response.json();

				if (json.ErrorType) {
					reject(json.ErrorType);
				}

				resolve(json);
			} catch (err) {
				reject(err);
			}
		});
	}

	public requestMissing(): Promise<any> {
		return new Promise(async (resolve, reject) => {
			try {
				const url = this.generateMissingUrl();
				const response = await fetch(url);
				const json: any = await response.json();

				if (json.ErrorType) {
					reject(json.ErrorType);
				}

				resolve(json);
			} catch (err) {
				reject(err);
			}
		});
	}

	public generateMissingUrl() {
		const baseUrl = `${process.env.BASE_URL}/api/DataDirect/StudentMissingAssignmentList`;
		const studentId = process.env.STUDENT_ID;
		const t = this.token;

		return `${baseUrl}?studentId=${studentId}&t=${t}`;
	}

	public generateUrl() {
		const baseUrl = `${process.env.BASE_URL}/api/mycalendar/assignments`;
		const startDate = dayjs().weekday(0).format("MM/DD/YYYY");
		const endDate = dayjs().add(3, "month").format("MM/DD/YYYY");
		const t = this.token;

		const filterString =
			"5023647_17002_89246320_4,5023647_17002_89246332_4,5023647_17002_89246344_4,5023647_17002_89277107_4,5023647_17002_89246379_4,5023647_17002_89246418_4,5023647_17002_89246530_4,5023647_17002_89277049_4,5023647_17002_89277101_4";
		const recentSave = false;

		return `${baseUrl}?startDate=${startDate}&endDate=${endDate}&t=${t}&filterString=${filterString}&recentSave=${recentSave}`;
	}

	public async getToken(retries = 5) {
		try {
			await this.monitor.ping({state: 'run'});
			this.token = await this.login();
			this.emit("ready", this.token);
			await this.monitor.ping({state: 'complete'});
			return this.token;
		} catch (err) {
			logger.error(err, "Failed to get token, retrying...");
			await this.monitor.ping({state: 'fail'});

			// take screenshot of error
			try {
				await this.page?.screenshot({ path: `./public/errors/error_${dayjs().format("YYYY-MM-DD-HH-MM-SS")}.png` });
				await this.browser?.close();
			} catch (err) {
				logger.error(err, "Failed to take screenshot");
				await this.browser?.close();
			}

			// retry
			if (retries > 0) {
				await this.getToken(retries - 1);
			} else {
				logger.error("All attempts failed");
				process.exit(1);
			}
		}
	}

	public login(): Promise<string> {
		return new Promise(async (resolve, reject) => {
			try {
				this.browser = await puppeteer.launch({ headless: true, args: ["--use-gl=egl"] });
				this.page = await this.browser.newPage();

				await this.page.goto(process.env.BASE_URL || "");
				logger.info("Connected to CORE");
				await this.page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });

				// login on core page
				logger.info("Entering username into CORE");
				await this.page.waitForSelector("#site-login-input .textfield INPUT");
				await this.page.waitForSelector(".btn-primary");
				logger.info("Found username input, waiting 1 second");
				await this.page.waitForTimeout(1000);
				logger.trace("Wait complete, entering username");
				await this.page.type("#site-login-input .textfield INPUT", process.env.EMAIL || "");
				await this.page.click(".btn-primary");
				logger.info("Username entered and clicked login button");
				await this.page.waitForNavigation();

				// google email login
				logger.info("Beginning Google login");
				await this.page.waitForSelector('.signin-card input[type="submit"]');
				logger.info("Found Google login button, waiting 1 second..");
				await this.page.waitForTimeout(1000);
				logger.trace("Wait complete, clicking Google login button");
				await this.page.click('.signin-card input[type="submit"]');
				logger.info("Google login button clicked");

				// google password section
				logger.info("Waiting for password input");
				await this.page.waitForSelector("input#password.mCAa0e");
				await this.page.waitForSelector("input#submit.MK9CEd.MVpUfe");
				logger.info("Found password input, waiting 1 second");
				await this.page.waitForTimeout(1000);
				logger.trace("Wait complete, entering password");
				await this.page.type("input#password.mCAa0e", process.env.PASSWORD || "");
				await this.page.click("input#submit.MK9CEd.MVpUfe");
				logger.info("Password entered and clicked login button");
				await this.page.waitForNavigation();

				let attempts = 0;
				while (this.page.url() !== `${process.env.BASE_URL}/app/student` || attempts >= 30) {
					attempts++;
					await this.page.waitForTimeout(1000);
				}

				if (attempts === 30) {
					reject("login failed");
				}

				// google login success
				const cookies = await this.page.cookies();
				const t = cookies.find((c) => c.name === "t");
				if (!t) {
					reject("Cookie not found");
					return;
				}

				logger.info("token cookie found");
				resolve(t.value);
			} catch (err) {
				reject(err);
			}
		});
	}
}

fs.mkdir("./public/errors", { recursive: true }).catch((err) => {});